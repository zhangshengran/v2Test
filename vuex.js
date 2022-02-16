let data = {a:1}

const p = new Proxy(data,{
  get(target,property){
    console.log('get')
    return Reflect.get(target,property)
  },
  set(target,property,value){
     console.log('set')
    return Reflect.set(target,property,value)
  }
})