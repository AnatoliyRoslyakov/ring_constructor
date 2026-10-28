import { normalizeDesign } from '../ring-design.js';
export function createDesignStore(initial){
 let stack=[normalizeDesign(initial)],index=0,lastKey='',lastTime=0;
 const clone=value=>JSON.parse(JSON.stringify(value));
 return {
  get:()=>clone(stack[index]),
  set(value,{coalesce=''}={}){
   const next=normalizeDesign(value);if(JSON.stringify(next)===JSON.stringify(stack[index]))return false;
   const now=performance.now(),replace=coalesce&&lastKey===coalesce&&now-lastTime<850&&index>0;
   stack=stack.slice(0,index+1);if(replace)stack[index]=next;else{stack.push(next);index++;}
   if(stack.length>60){stack.shift();index--;}
   lastKey=coalesce;lastTime=now;return true;
  },
  undo(){if(index>0)index--;lastKey='';return this.get();},redo(){if(index<stack.length-1)index++;lastKey='';return this.get();},
  get canUndo(){return index>0;},get canRedo(){return index<stack.length-1;}
 };
}
