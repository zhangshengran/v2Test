import { effect } from './effect'
export function watch(target, cb) {
  effect(() => {
    // 遍历所有Key
    tranverse(target)
  }, {
    scheduler: (fn) => {
      cb()
    }
  })
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
}