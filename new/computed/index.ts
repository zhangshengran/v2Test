import { effect, track, trigger } from "../effect";
//属性，懒执行（有缓存），computed变化，包涵computed也重新响应变化
// computed其实是俩个effect包涵的问题处理
export function computed(fn) {
  let dirty = true
  let value;
  const effectFn: any = effect(fn,
    {
      lazy: true, scheduler: (fn) => {
        dirty = true//只要有值更新了，那computed也得重新算
        // fn() //这个时候不用在这里调用，下面的trigger其实触发的就是此Fn的执行
        trigger(obj, 'value') //触发 包裹了computed属性的effect执行
      }
    })

  let obj = {
    get value() {
      if (dirty) {
        dirty = false//标记 ，进行缓存
        value = effectFn()//获取value的时候去执行拿到值
      }
      track(obj, 'value')//收集到的依赖是包裹了computed属性的effect
      return value
    }
  }
  return obj
}