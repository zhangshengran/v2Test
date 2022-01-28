export class Vue{
  constructor(options){
    this._data = options.data
    // _proxy.call(this,options.data)
    _proxy.call(this, options.data);/*构造函数中*/
    observe( this._data,options.render)
    
  }
}

function observe(value,cb){
  Object.keys(value).forEach((key)=>{
    defineReactive(value,key,value[key],cb)
  })
}

function defineReactive(obj,key,val,cb){
  Object.defineProperty(obj,key,{
    enumerable:true,
    configurable:true,
    get(){
      // 收集依赖
      // debugger
      return obj[key]
      // return val;
    },
    set:(newVal)=>{
      val = newVal
      cb()
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