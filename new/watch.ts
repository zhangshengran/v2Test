import { effect } from './effect'
export function watch(target, cb, options: any = {}) {
  let getter;
  if (typeof target === 'function') {
    getter = target
  } else {
    // 遍历所有Key
    getter = () => tranverse(target)
  }

  let oldValue
  let newValue
  const job = () => {
    if (options.flush) {
      switch (options.flush) {
        case 'post':
          let p = Promise.resolve()
          p.then(() => {
            newValue = effectFn()
            cb(oldValue, newValue)
            oldValue = newValue
          })
      }
    } else {
      newValue = effectFn()
      cb(oldValue, newValue)
      oldValue = newValue

    }




  }

  const effectFn: any = effect(() => {
    return getter()
  }, {
    lazy: true,
    scheduler: job
  })
  if (options.immediate) {
    job()
  } else {
    oldValue = effectFn()

  }
}

/**
 * 描述 深度遍历对象的所有值
 * @author zhangshengran
 * @date 2022-02-25
 * @param {any} value
 * @param {any} seen=newSet(
 * @returns {any}
 */
function tranverse(target, seen = new Set()) {
  if (typeof target !== 'object' && !target && seen.has(target)) return
  for (const key in target) {
    let v = target[key]
    tranverse(v)
  }
  return target
}