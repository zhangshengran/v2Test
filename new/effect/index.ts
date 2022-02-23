
let global = new Map();
let activeEffect;
export function track(target, key) {
  if (activeEffect) {
    let depsMap = global.get(target)
    if (!depsMap) {
      global.set(target, depsMap = new Map());
    }
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, deps = new Set());
    }
    deps.add(activeEffect);
  }
}
export function trigger(target, key) {
  let depsMap = global.get(target)
  let deps = depsMap.get(key)

  deps.forEach((effectFn) => {
    if (activeEffect !== effectFn) effectFn()
    // if (effectFn.options.scheduler) {
    //   effectFn.options.scheduler(effectFn)
    // } else {
    //   effectFn()
    // }
  })
}

export function effect(cb, options = {} as any) {
  function effectFn() {
    activeEffect = effectFn;
    cb()
    activeEffect = null
  }
  effectFn.options = options
  effectFn()

}



