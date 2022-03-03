import { computed, effect, reactive, watch, nextTick } from 'vue'

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
  let cm = computed(computedFn)
  effect(eFn)
  expect(eFn).toBeCalledTimes(1)
  expect(computedFn).toBeCalledTimes(1)

  expect(num).toBe(4)
  rec.a++ //a更新了，然后computed的计算也重新执行了。
  expect(computedFn).toBeCalledTimes(2)
  expect(eFn).toBeCalledTimes(3)
  expect(num).toBe(6)

})
function ajaxMock(delayTime) {

  return new Promise((res) => {

    setTimeout(() => {
      res('ok' + delayTime)
    }, delayTime);
  })
}


test('watch支持onInvalidate', (done) => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  let finalDate
  let execTime = 0
  const mockFn = jest.fn(async (oldVal, newVal, onInvalidate) => {
    console.log('watch执行啦', oldVal, newVal)
    let expired = false
    onInvalidate(() => {
      expired = true
    })
    let res
    execTime++
    if (execTime === 1) {
      // 第一次的时候，ajax会在2000ms后返回
      res = await ajaxMock(200)
      console.log('返回结果一', res)
    } else if (execTime === 2) {
      // 第二次的时候，ajax会在500ms后返回
      res = await ajaxMock(500)
      console.log('返回结果二', res)

    }
    // else {
    //   res = await ajaxMock(0)
    //   console.log('返回结果三', res)

    // }
    console.log('expired', expired)
    if (!expired) {
      finalDate = res
    }
  })

  watch(() => rec.a, mockFn)
  rec.a++
  rec.a++
  // rec.a++
  setTimeout(() => {
    expect(finalDate).toBe('ok1000')
    // 虽然第一次调用返回的晚，但是结果还是采取的第二次调用的，第一次的被标记为已过期
    expect(mockFn).toBeCalledTimes(2)
    done()
  }, 1000)
})


test('watch支持只监听一个值', () => {

  // 侦听一个 getter
  const state = reactive({ count: 0 })
  let mockFn = jest.fn((count, prevCount) => {
    /* ... */
    console.log(123)
  })
  watch(
    state,
    mockFn
  )
  state.count++
  expect(mockFn).toBeCalledTimes(1)

  // let c1 = { a: 1, b: 2 };
  // let rec = reactive(c1);
  // const mockFn = jest.fn(() => {
  //   console.log('watch执行啦')
  // })
  // watch(() => rec.a, mockFn)
  // expect(mockFn).toBeCalledTimes(0)
  // rec.a++
  // expect(mockFn).toBeCalledTimes(1)//执行
  // rec.b++
  // expect(mockFn).toBeCalledTimes(1) //不执行
})

it('test', async () => {
  const src = reactive({
    count: 0
  })
  let dummy
  let spy = jest.fn(({ count }) => {
    dummy = count
    // debugger
    console.log('ddd')
  })
  watch(() => src.count, spy)
  src.count++
  await nextTick()
  expect(dummy).toBe(1)
  expect(spy).toBeCalledTimes(1)
})
