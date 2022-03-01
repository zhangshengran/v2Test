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



test('watch支持配置回调的执行时机', (done) => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);

  let num = 0

  const mockFn = jest.fn((oldVal, newVal) => {
    // console.log('watch执行啦', oldVal, newVal)
    console.log('调用三')
    num += 2

  })

  function testA() {
    console.log('调用一')
    num += 3
  }
  function testB() {
    console.log('调用二')
    num += 5
  }
  watch(() => rec.a, mockFn, { flush: 'post' })//同步代码执行完 后调用
  rec.a++//先执行了回调，但是值没加2，先加完同步代码后才执行的加2
  testA()
  expect(num).toBe(3)
  testB()
  expect(num).toBe(8)
  setTimeout(() => {
    expect(num).toBe(10)
    done()
  }, 1000)
})


/**
 * 描述  传入一个时间，到点后返回值 ，模拟ajax
 * @author zhangshengran
 * @date 2022-02-28
 * @param {any} delayTime
 * @returns {any}
 */
function ajaxMock(delayTime) {

  return new Promise((res) => {

    setTimeout(() => {
      res('ok' + delayTime)
    }, delayTime);
  })
}

test('watch支持onInvalidate', (done) => {
  let count = 0
  function fetch() {
    count++
    const res = count === 1 ? 'A' : 'B'
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(res)
      }, count === 1 ? 1000 : 100);
    })
  }

  let finallyData
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);

  watch(() => rec.a, async (newVal, oldVal, onInvalidate) => {
    let valid = true
    // 这个onInvalidate的关键是只要闭包没释放时，谁最先返回结果了，谁就会把闭包的变量修改掉，然后再
    // 执行的时候变量已经变了，故被淘汰。相当于是个锁
    onInvalidate(() => {
      valid = false
    })
    const res = await fetch()

    if (!valid) return

    finallyData = res
    console.log(finallyData)
  })

  rec.a++
  setTimeout(() => {
    rec.a++
  }, 200);
  setTimeout(() => {
    expect(finallyData).toBe('B')
    done()
  }, 2000);
})
