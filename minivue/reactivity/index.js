// class Dep{
//   constructor(){}

// }
class Dep {
  constructor() {
    this.deps = new Set()
  }
  add(dep) {
    this.deps.add(dep)
  }
  notify() {
    this.deps.forEach(dep => {
      dep()
    });

  }
}

function getDeps(target, key) {
  let DepsMap = globalDepMap.get(target)

  if (!DepsMap) {
    DepsMap = new Map()
    globalDepMap.set(target, DepsMap)
  }
  let deps = DepsMap.get(key)
  if (!deps) {
    deps = new Dep()
    DepsMap.set(key, deps)
  }
  return deps
}
const globalDepMap = new Map()
let currentDep;
function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      // 收集依赖
      let deps = getDeps(target, key)
      currentDep && deps.add(currentDep)
      return Reflect.get(target, key);
    },
    set(target, key, value) {

      // 执行依赖
      let deps = getDeps(target, key)
      deps.notify()

      return Reflect.set(target, key, value);
    },
  });
}

function effectWatch(fn) {
  currentDep = fn
  fn()
  currentDep = null
}

let ddd = window.ddd = reactive({ aaa: 123 })
effectWatch(() => {
  // debugger
  console.log(`aaa值为${ddd.aaa}`)
  let ccc = ddd.aaa + 1
  let body = document.querySelector('body')
  body.innerHTML = `num:${ccc}`
})

// setInterval(() => {
//   ddd.aaa++
// }, 1000)