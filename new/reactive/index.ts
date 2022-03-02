import { track, trigger } from '../effect/index'
export const ITERATE_KEY = Symbol()

export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      if (typeof target[key] === "object") {
        return reactive(target[key]);
      }
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      // 优化，假如值没变，不需要触发依赖
      const result = Reflect.set(target, key, value);
      trigger(target, key) //加一些优化，如果是改变已有的值，不需要出发 for in的依赖
      return result
    },
    // 代理 in操作符
    has(target, key) {
      track(target, key)
      return Reflect.has(target, key)
    },
    // 代理 for in 循环 for in会出发 ownkey
    ownKeys(target) {
      track(target, ITERATE_KEY)
      return Reflect.ownKeys(target)
      // 拿不到 具体访问的key
    },
    deleteProperty(target, key) {
      let res
      const isOwnKey = target.hasOwnProperty(key)
      if (isOwnKey) {
        res = Reflect.deleteProperty(target, key)
      }
      if (res === true && isOwnKey) {
        trigger(target, key)//删除了要把 for in更新
      }
      return res
      // 删除操作代理 判断删除的是否是自己身上的key，不是则不处理
      // 删除的时候，要出发 for in的依赖
    },

  });
}



