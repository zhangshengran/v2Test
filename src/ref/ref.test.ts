import { ref, toRef, toRefs } from './index'
import { effect } from '../effect'
import { reactive } from '../reactive'
test('ref基本', () => {
  let a = ref(1)
  let num
  let spy = jest.fn(() => {
    console.log(a.value)
    num = a.value
  })
  effect(spy)
  expect(spy).toBeCalledTimes(1)
  a.value++
  expect(spy).toBeCalledTimes(2)
  expect(num).toBe(2)
})


test('toRef基本', () => {
  let aa = reactive({ b: 1 })
  let toR = toRef(aa, 'b')
  let num: any = 0
  let spy = jest.fn(() => {
    console.log(toR.value)
    num = toR.value
  })
  effect(spy)
  aa.b++
  expect(num).toBe(2)//响应式没丢失
  toR.value++
  expect(num).toBe(3)

})


test('toRefs', () => {
  let aa = reactive({ a: 2, b: 1 })
  let toR: any = { ...toRefs(aa) }//解构后响应式没丢失
  let num: any = 0
  let spy = jest.fn(() => {
    console.log(toR.a)
    num = toR.a //自动脱ref了  不用访问value
  })
  effect(spy)
  aa.b++
  expect(num).toBe(2)//响应式没丢失
})


