import { track, trigger } from '../effect/index'
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
      const result = Reflect.set(target, key, value);
      trigger(target, key)
      return result
    },
  });
}



