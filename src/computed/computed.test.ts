import { reactive } from '../reactive'
import { computed } from './index'
import { effect } from '../effect'
test('自执行computed', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  let num
  let eFn = jest.fn(() => {
    // console.log('111', rec.a + cm.value)
    num = rec.a + cm.value
    console.log('num', num)
  })
  let computedFn = jest.fn(() => {
    return rec.a + rec.b
  })
  let cm: any = computed(computedFn)
  effect(eFn)
  expect(eFn).toBeCalledTimes(1)
  expect(computedFn).toBeCalledTimes(1)
  expect(num).toBe(4)
  rec.a++ //a更新了，然后computed的计算也重新执行了。
  expect(computedFn).toBeCalledTimes(2)
  expect(eFn).toBeCalledTimes(3)
  expect(num).toBe(6)

})


test('获取computed的值', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  let eFn = jest.fn(() => {
    console.log(rec.a)
  })
  expect(eFn).toHaveBeenCalledTimes(0)
  let cm = computed(eFn)
  cm.value
  expect(eFn).toHaveBeenCalledTimes(1)

})
