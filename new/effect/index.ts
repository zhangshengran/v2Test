
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
    activeEffect.deps.push(deps)//支持回收不用到的副作用
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
function cleanup(effect) {
  effect.deps.forEach((deps) => {
    deps.delete(activeEffect)
  })
}
export function effect(cb, options = {} as any) {
  function effectFn() {
    cleanup(effectFn)//每次执行之前，把这个副作用相关连的依赖都清掉，重新收集 。支持条件选择优化
    activeEffect = effectFn;
    cb()//执行的时候会重新收集一遍依赖
    activeEffect = null
  }
  effectFn.options = options
  effectFn.deps = []
  effectFn()

}



