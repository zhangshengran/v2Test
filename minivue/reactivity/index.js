
const globalDepMap = new Map()
let currentDep;
class Dep {
  constructor() {
    this.deps = new Set()
  }
  depend() {
    currentDep && this.deps.add(currentDep)
  }
  notify() {
    this.deps.forEach(dep => {
      dep()
    });

  }
}

class Ref {
  constructor(value) {
    this._value = value
    this.deps = new Dep()
  }
  get value() {
    // 收集依赖
    this.deps.depend()
    return this._value
  }

  set value(value) {
    this.deps.notify()
    this._value = value
  }
}
function ref(target) {
  return createRef(target)
}
function createRef(target) {
  return new Ref(target)
}
// let ref1 = window.ref1 = ref(0)

// effectWatch(() => {
//   console.log('ref1', ref1.value)
// })
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

function reactive(target) {
  return new Proxy(target, {
    get(target, key) {
      // 收集依赖
      let deps = getDeps(target, key)
      deps.depend()
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
  // debugger
  currentDep = fn
  fn()
  currentDep = null
}


export { ref, effectWatch, reactive }