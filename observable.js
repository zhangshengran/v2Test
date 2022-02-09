function observe(value){
  Object.keys(value).forEach(key => {
    defineReactive(value,key,value[key])
  });
}

function defineReactive(obj,key,val){
  let newDep = new Dep()
  Object.defineProperty(obj,key,{
    enumerable:true,
    configurable:true,
    get(){
      console.log('收集依赖')
      if(newDep){
        newDep.add(Dep.target)
        Dep.target = null
      }
      return val
      // 收集依赖
    },
    set(newVal){
      // 触发更新
        console.log('触发更新')
        newDep.notify()
      val = newVal
      
    }
  })
}

let objA = {a:1,b:2}
class Dep{
  constructor(){
    this.deps = []
  }
  add(){
  Dep.target &&  this.deps.push(Dep.target)
  }
  notify(){
    this.deps.forEach((cb)=>{
      cb()
    })
  }
}

// let objB = {b:1,c:2}

// let objC = objB.b+objA.a

function watchEffect(cb){
  Dep.target = cb
  // cb()
}


observe(objA)

watchEffect(()=>{
  console.log('副作用更新',objA.a+1)
})

setInterval(()=>{
  objA.a++
  watchEffect(()=>{
  console.log('副作用更新',objA.a+1)
})
},2000)
