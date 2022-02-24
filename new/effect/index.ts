
let global = new Map();
let activeEffect;
let activeEffectArr: Array<any> = []
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
  if (!depsMap) return
  let deps = depsMap.get(key)
  let runDepsArr: Array<any> = []
  deps.forEach((effectFn) => {

    if (activeEffect !== effectFn) runDepsArr.push(effectFn)


  })

  runDepsArr.forEach(effectFn => {
    if (effectFn.options.scheduler) {
      effectFn.options.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
function cleanup(effectFn) {
  effectFn.deps.forEach((deps) => {
    deps.delete(activeEffect)
  })
  effectFn.deps.length = 0
}
export function effect(cb, options = {} as any) {
  function effectFn() {
    activeEffect = effectFn;
    activeEffectArr.push(effectFn)
    cleanup(effectFn)//每次执行之前，把这个副作用相关连的依赖都清掉，重新收集 。支持条件选择优化
    let result = cb()//执行的时候会重新收集一遍依赖
    activeEffectArr.pop()

    activeEffect = activeEffectArr[activeEffectArr.length - 1]
    return result
  }
  effectFn.options = options
  effectFn.deps = []
  if (options.lazy) {
    return effectFn
  } else {
    effectFn()
  }

}



const jobQueue = new Set()

let isFlushing = false

export function addAsyncJob(job) {
  jobQueue.add(job)
  return flushJob()
}
export function flushJob() {
  if (isFlushing) return
  isFlushing = true
  return Promise.resolve().then(() => {
    jobQueue.forEach((job: any) => {
      job()
    })
  }).finally(() => {
    isFlushing = false
  })
}
