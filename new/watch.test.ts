import { watch } from './watch'
import { reactive } from './reactive'
//watch最基础用法， 接收一个响应式对象，当里边有值变化，调用传入的回调函数
test('watch', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  const mockFn = jest.fn(() => {
    console.log('watch执行啦')
  })
  watch(rec, mockFn)
  expect(mockFn).toBeCalledTimes(0)
  rec.a++
  expect(mockFn).toBeCalledTimes(1)
  rec.b++
  expect(mockFn).toBeCalledTimes(2)
})

test('watch支持只监听一个值', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  const mockFn = jest.fn(() => {
    console.log('watch执行啦')
  })
  watch(() => rec.a, mockFn)
  expect(mockFn).toBeCalledTimes(0)
  rec.a++
  expect(mockFn).toBeCalledTimes(1)//执行
  rec.b++
  expect(mockFn).toBeCalledTimes(1) //不执行
})


test('watch回调中能拿到变化前后的值', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  const mockFn = jest.fn((oldVal, newVal) => {
    console.log('watch执行啦', oldVal, newVal)
    expect(oldVal).toBe(1)//
    expect(newVal).toBe(2)

  })
  watch(() => rec.a, mockFn)
  // rec.a++
})

test('立即执行的watch', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  const mockFn = jest.fn((oldVal, newVal) => {
    console.log('watch执行啦', oldVal, newVal)

  })

  watch(() => rec.a, mockFn, { immediate: true })
  rec.a++
  expect(mockFn).toHaveBeenCalledTimes(2)
  expect(mockFn.mock.calls[0][0]).toBe(undefined);
  expect(mockFn.mock.calls[0][1]).toBe(1);
  expect(mockFn.mock.calls[1][0]).toBe(1);
  expect(mockFn.mock.calls[1][1]).toBe(2);


})