import { reactive } from '../reactive'
import { effect, addAsyncJob } from '../effect/index'

test('scheduler逻辑测试', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  const efn = jest.fn(() => {
    console.log('111', rec.a)
  })
  let fn: any = effect(efn, {
    lazy: true, scheduler: (fn) => {
      console.log('scheduler执行')
      fn()
    }
  })
  expect(efn).toBeCalledTimes(0)
  fn()
  expect(efn).toBeCalledTimes(1)
  rec.a++
  expect(efn).toBeCalledTimes(2)
  rec.a++
  expect(efn).toBeCalledTimes(3)
  // expect(num).toBe(4)
})


test('支持effect嵌套', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  const effect2 = jest.fn(() => {
    rec.b
    // console.log('nei', rec.b)
  })
  const effect1 = jest.fn(
    () => {
      rec.a
      // console.log('outer', rec.a)
      effect(effect2)
    }
  )
  effect(effect1)
  expect(effect1).toHaveBeenCalledTimes(1)
  expect(effect2).toHaveBeenCalledTimes(1)
  rec.b = 5
  expect(effect1).toHaveBeenCalledTimes(1)
  expect(effect2).toHaveBeenCalledTimes(2)
})


test('支持优化条件选择，自动清除用不到的依赖', () => {
  const bFn = jest.fn(() => {
    // console.log('b访问')
    rec.b
    // console.log(rec.b)
  })
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  effect(() => {
    rec.a === 1 ? bFn() : console.log(222)
  })
  // The mock function is called 
  // expect(bFn.mock.calls.length).toBe(2);
  // 一开始effect会自执行一次，且rec.a===1,所有会执行bFn,bFn中访问rec.b，所b的依赖也会把effect收集进去
  expect(bFn).toHaveBeenCalledTimes(1);
  rec.b++
  // b变更后，effect执行，bFn继续被调用
  expect(bFn).toHaveBeenCalledTimes(2);
  rec.a = 2
  // a的值变了以后，此时再修改b的值，不应该再触发effect执行了，因为此时条件为假，b的依赖应该没有effect了。
  expect(rec.a).toBe(2)
  rec.b++ //所有b修改了，但是bFn没调用。完美
  expect(bFn).toHaveBeenCalledTimes(2);

})

test("scheduler", (done) => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);


  async function scheduler(fn) {
    // Promise.resolve(() => {
    //   fn()
    // })
    setTimeout(() => {
      fn()
      expect(rec.a).toBe(2)
      done()
    })

  }

  effect(async () => {
    console.log(rec.a)
  }, {
    scheduler: scheduler
  })
  // expect(scheduler).not.toHaveBeenCalled();
  console.log(1111)
  rec.a++
  console.log(222)

})


test('优化：多次更新一个值，effect只执行一次', (done) => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);

  const jobFn = jest.fn(() => {
    console.log(rec.a)
  })
  effect(jobFn, {
    scheduler: async function (fn) {
      await addAsyncJob(fn)
      expect(jobFn).toHaveBeenCalledTimes(2)//下面更新了俩次，不算初次执行，函数只执行了一次
      done()
    }
  })
  rec.a++
  rec.a++
})


test('effect支持lazy属性，不立即执行,手动调用时才执行', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  let eFn = jest.fn(() => {
    console.log(rec.a)
  })
  let effectFn: any = effect(eFn, {
    lazy: true
  })
  expect(eFn).toHaveBeenCalledTimes(0)
  effectFn()
  expect(eFn).toHaveBeenCalledTimes(1)

})