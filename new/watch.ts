import { effect } from './effect'
export function watch(target, cb) {
  let oldValue
  let newValue
  const effectFn: any = effect(() => {
    if (typeof target === 'function') {
      return target()
    } else {
      // 遍历所有Key
      return tranverse(target)
    }

  }, {
    lazy: true,//懒执行
    scheduler: (fn) => {
      // 当每次effect更新的时候，重新计算effect
      newValue = effectFn()
      cb(oldValue, newValue)
      oldValue = newValue
    }
  })
  oldValue = effectFn()
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