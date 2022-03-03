import { ref } from './index'
import { effect } from '../effect'

test('ref基本', () => {
  let a = ref(1)
  let spy = jest.fn(() => {
    console.log(a.value)
  })
  effect(spy)
  expect(spy).toBeCalledTimes(1)
  a.value++
  expect(spy).toBeCalledTimes(2)
})