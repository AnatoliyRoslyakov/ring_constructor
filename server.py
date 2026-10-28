from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import gzip, io, re, json, base64, uuid, threading, time
from urllib.parse import urlsplit, parse_qs
from backend.ring_schema import validate_design, RecipeError
from backend.deepseek import generate, capabilities, AIError
ROOT=Path(__file__).resolve().parent
FRAMES=ROOT/'work'/'frames'
TEXT_TYPES={'.js','.css','.json','.gltf','.svg'}
COMPRESSED={}
REQUESTS=ROOT/'work'/'ring-requests'
REQUEST_LOCK=threading.Lock()
REQUEST_TIMES=[]
def private_path(path):
    path=Path(path).resolve()
    try: parts=path.relative_to(ROOT).parts
    except ValueError: return True
    return any(part.startswith('.') or part in ('work','backend','node_modules','scripts') for part in parts) or path.suffix in ('.py','.pyc','.key','.pem')

class Handler(SimpleHTTPRequestHandler):
    def __init__(self,*args,**kwargs): super().__init__(*args,directory=str(ROOT),**kwargs)
    def end_headers(self):
        url=urlsplit(self.path)
        suffix=Path(url.path).suffix
        immutable=(url.path.startswith('/chunks/') and suffix=='.js') or (url.path.startswith('/assets/fonts/') and suffix=='.woff2') or (suffix=='.mp4' and bool(parse_qs(url.query).get('v')))
        self.send_header('Cache-Control','public, max-age=31536000, immutable' if immutable else 'no-cache')
        if suffix in TEXT_TYPES: self.send_header('Vary','Accept-Encoding')
        if suffix=='.mp4': self.send_header('Accept-Ranges','bytes')
        super().end_headers()
    def send_head(self):
        path=Path(self.translate_path(self.path)).resolve()
        if private_path(path):
            self.send_error(404);return
        accepts_gzip=any(part.strip().split(';')[0]=='gzip' and not re.search(r';\s*q=0(?:\.0*)?\s*$',part) for part in self.headers.get('Accept-Encoding','').split(','))
        if not accepts_gzip or self.headers.get('Range') or path.suffix not in TEXT_TYPES or not path.is_file():
            return super().send_head()
        stat=path.stat()
        if stat.st_size<1024: return super().send_head()
        stamp=(stat.st_mtime_ns,stat.st_size)
        etag=f'"{stat.st_mtime_ns:x}-{stat.st_size:x}-gzip"'
        validators=[value.strip() for value in self.headers.get('If-None-Match','').split(',')]
        if etag in validators or '*' in validators:
            self.send_response(304);self.send_header('ETag',etag);self.end_headers();return
        cached=COMPRESSED.get(path)
        if cached is None or cached[0]!=stamp:
            cached=(stamp,gzip.compress(path.read_bytes(),compresslevel=6))
            if len(COMPRESSED)>128: COMPRESSED.clear()
            COMPRESSED[path]=cached
        payload=cached[1]
        self.send_response(200)
        self.send_header('Content-Type',self.guess_type(str(path)))
        self.send_header('Content-Encoding','gzip')
        self.send_header('Content-Length',str(len(payload)))
        self.send_header('Last-Modified',self.date_time_string(stat.st_mtime))
        self.send_header('ETag',etag)
        self.end_headers()
        return io.BytesIO(payload)
    def do_GET(self):
        if urlsplit(self.path).path=='/api/ring-config':
            self.send_json(200,{'emailConfigured':False,'ai':capabilities()});return
        if private_path(self.translate_path(self.path)):
            self.send_error(404);return
        raw=self.headers.get('Range')
        if raw and self.path.split('?')[0].endswith('.mp4'):
            path=Path(self.translate_path(self.path))
            if not path.is_file(): self.send_error(404);return
            size=path.stat().st_size
            match=re.fullmatch(r'bytes=(\d*)-(\d*)',raw)
            if not match: self.send_error(416);return
            first,last=match.groups()
            start=int(first) if first else max(0,size-int(last or size))
            end=min(size-1,int(last) if first and last else size-1)
            if start>=size or start>end:
                self.send_response(416);self.send_header('Content-Range',f'bytes */{size}');self.end_headers();return
            self.send_response(206)
            self.send_header('Content-Type','video/mp4')
            self.send_header('Content-Length',str(end-start+1))
            self.send_header('Content-Range',f'bytes {start}-{end}/{size}')
            self.end_headers()
            try:
                with path.open('rb') as stream:
                    stream.seek(start);remaining=end-start+1
                    while remaining:
                        data=stream.read(min(262144,remaining))
                        if not data: break
                        self.wfile.write(data);remaining-=len(data)
            except (BrokenPipeError,ConnectionResetError): pass
            return
        super().do_GET()
    def do_POST(self):
        if urlsplit(self.path).path=='/api/ring-ai':
            self.generate_ring();return
        if urlsplit(self.path).path=='/api/ring-requests':
            self.save_ring_request();return
        match=re.fullmatch(r'/__studio/frame/(\d{4})',self.path)
        if not match:
            self.send_error(404);return
        count=int(self.headers.get('Content-Length','0'))
        if count>4000000:
            self.send_error(413);return
        FRAMES.mkdir(parents=True,exist_ok=True)
        (FRAMES/f'{match[1]}.jpg').write_bytes(self.rfile.read(count))
        self.send_response(204);self.end_headers()
    def send_json(self,status,payload):
        data=json.dumps(payload,ensure_ascii=False).encode('utf-8')
        self.send_response(status);self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Cache-Control','no-store');self.send_header('Content-Length',str(len(data)))
        self.end_headers();self.wfile.write(data)
    def generate_ring(self):
        if self.headers.get('Origin') not in ('http://localhost:8765','http://127.0.0.1:8765'):
            self.send_json(403,{'error':'Недопустимый источник запроса.'});return
        try:
            size=int(self.headers.get('Content-Length','0'))
            if not 0<size<=3000000 or self.headers.get('Content-Type','').split(';')[0]!='application/json': raise AIError('Некорректный запрос эскиза.',400)
            body=json.loads(self.rfile.read(size))
            self.send_json(200,generate(body))
        except AIError as error:self.send_json(error.status,{'error':str(error),'retryable':error.retryable})
        except (ValueError,TypeError):self.send_json(400,{'error':'Не удалось прочитать параметры эскиза.'})
        except (BrokenPipeError,ConnectionResetError):pass
    def list_directory(self,path):
        self.send_error(404);return None
    def save_ring_request(self):
        origin=self.headers.get('Origin')
        if origin and origin not in ('http://localhost:8765','http://127.0.0.1:8765'):
            self.send_json(403,{'error':'Недопустимый источник заявки.'});return
        try:
            size=int(self.headers.get('Content-Length','0'))
            if size<2 or size>5000000: raise ValueError('Некорректный размер заявки.')
            if self.headers.get('Content-Type','').split(';')[0]!='application/json': raise ValueError('Требуется JSON.')
            body=json.loads(self.rfile.read(size))
            if not isinstance(body,dict): raise ValueError('Некорректная заявка.')
            if not isinstance(body.get('id'),str): raise ValueError('Не передан номер заявки.')
            request_id=str(uuid.UUID(body['id']))
            if body.get('company'): raise ValueError('Не удалось принять заявку.')
            email=str(body.get('email','')).strip()
            if len(email)>254 or not re.fullmatch(r'[^\s@<>\r\n]+@(?:[A-Za-z0-9-]+\.)+[A-Za-z]{2,63}',email): raise ValueError('Укажите корректную почту.')
            if body.get('consent') is not True: raise ValueError('Нужно согласие на использование данных для ответа.')
            design=body.get('design')
            if not isinstance(design,dict): raise ValueError('Не переданы параметры кольца.')
            clean=validate_design(design)
            preview=body.get('preview','')
            if not isinstance(preview,str) or not preview.startswith('data:image/png;base64,'): raise ValueError('Не передан PNG-макет.')
            image=base64.b64decode(preview.split(',',1)[1],validate=True)
            if not image.startswith(b'\x89PNG\r\n\x1a\n') or len(image)>3500000: raise ValueError('Некорректный PNG-макет.')
            payload={'id':request_id,'reference':request_id[:8].upper(),'created':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'email':email,'name':str(body.get('name',''))[:80],'comment':str(body.get('comment',''))[:2000],'consent':True,'design':clean,'delivery':'local'}
        except (ValueError,TypeError,KeyError,OverflowError):
            self.send_json(400,{'error':'Проверьте почту, согласие и параметры эскиза.'});return
        with REQUEST_LOCK:
            folder=REQUESTS/request_id
            if not (folder/'request.json').exists():
                now=time.monotonic();REQUEST_TIMES[:]=[t for t in REQUEST_TIMES if now-t<3600]
                if len(REQUEST_TIMES)>=30:
                    self.send_json(429,{'error':'Слишком много заявок. Попробуйте позже.'});return
                try:
                    folder.mkdir(parents=True,exist_ok=True,mode=0o700)
                    (folder/'preview.png').write_bytes(image)
                    (folder/'request.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
                    REQUEST_TIMES.append(now)
                except OSError:
                    self.send_json(500,{'error':'Не удалось сохранить заявку. Попробуйте ещё раз.'});return
        self.send_json(201,{'reference':payload['reference'],'delivery':'local'})
    def log_message(self,format,*args):
        if not self.path.startswith('/__studio'): super().log_message(format,*args)
if __name__=='__main__':
    print('ORIGIN Atelier → http://localhost:8765',flush=True)
    ThreadingHTTPServer(('127.0.0.1',8765),Handler).serve_forever()
