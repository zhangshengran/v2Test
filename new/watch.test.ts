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
  const mockFn = (oldVal, newVal) => {
    console.log('watch执行啦', oldVal, newVal)
    expect(oldVal).toBe(1)
    expect(newVal).toBe(2)

  }
  watch(() => rec.a, mockFn)
  rec.a++
})

// test('立即执行的watch', () => {
//   let c1 = { a: 1, b: 2 };
//   let rec = reactive(c1);
//   const mockFn = jest.fn(() => {
//     console.log('watch执行啦')
//   })
//   watch(rec, mockFn, {
//     immediate: true
//   })
//   expect(mockFn).toBeCalledTimes(1)//立即执行
//   rec.a++
//   expect(mockFn).toBeCalledTimes(2)
// })