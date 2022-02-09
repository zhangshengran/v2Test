export class Vue{
  constructor(options){
    this._data = options.data
    // _proxy.call(this,options.data)
    _proxy.call(this, options.data);/*构造函数中*/
    observe( this._data,options.render)
    let watcher = new Watcher(this,)
  }
}

function observe(value,cb){
  Object.keys(value).forEach((key)=>{
    defineReactive(value,key,value[key],cb)
  })
}

function defineReactive(obj,key,val,cb){
    let dep = new Dep()
  Object.defineProperty(obj,key,{
    enumerable:true,
    configurable:true,
    get(){
      // 收集依赖
      if(Dep.target){
        dep.addSub(Dep.target)
      }
      return val
    },
    set:(newVal)=>{
      val = newVal
     dep.notify()
    }
  })
}

function _proxy(data){
  const that = this
  Object.keys(data).forEach((key)=>{
    Object.defineProperty(that,key,{
      enumerable:true,
      configurable:true,
      get(){
        // debugger
        return that._data[key]
      },
      set(newVal){
        that._data[key] = newVal
      }
    })
  })
}

class Watcher{
  constructor(vm,expOrFn,cb,options){
    this.cb = cb
    this.vm = vm
   Dep.target = this
  //  this.cb.call(this.vm)
  }

  update(){
    debugger
    // this.cb.call(this.vm)
  }
}
class Dep{
  constructor(){
    this.subs = []
  }
  addSub(sub){
    this.subs.push(sub)
  }
  notify(){
    this.subs.forEach((sub)=>{
        sub.update()
    })
  }
}