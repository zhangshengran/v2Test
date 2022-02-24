import { effect, track, trigger } from "../effect";
//三大属性，懒执行（有缓存），
export function computed(fn) {
  // let 
  const effectFn: any = effect(fn,
    {
      lazy: true, scheduler: (fn) => {
        trigger(obj, 'value')
      }
    })

  let obj = {
    get value() {
      let value = effectFn()//获取value的时候去执行拿到值
      track(obj, 'value')
      return value
    }
  }
  return obj
}