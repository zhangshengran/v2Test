import { reactive } from "../reactive"
export function ref(value) {
  let wrapper = {
    value: value
  }
  Object.defineProperty(wrapper, '__v_isRef', { value: true })//设定一个标记且不可枚举
  let react = reactive(wrapper)
  return react
}

export function toRef(obj, key) {
  let wrapper = {
    get value() {
      return obj[key]
    },
    set value(val) {
      obj[key] = val
    }
  }
  Object.defineProperty(wrapper, '__v_isRef', { value: true })//设定一个标记且不可枚举

  return wrapper
}

export function toRefs(obj) {
  let retObj = {}
  Object.keys(obj).forEach((key) => {
    retObj[key] = toRef(obj, key)
  })
  return proxyRefs(retObj)
}
// 自动脱ref
export function proxyRefs(target) {
  return new Proxy(target, {
    get(target, key, receiver) {
      const value = target[key]
      return value.__v_isRef ? value.value : value
    }
  })
}