import { reactive } from './index'
import { effect, addAsyncJob } from '../effect/index'
import { computed } from '../computed'
test('reactive1', () => {
  let res = 0
  let c1 = { a: 1, b: { c: 123 } };
  let rec = reactive(c1);
  effect(() => {
    res = rec.a
  });
  rec.a++
  expect(res).toBe(2)
})

test('对象嵌套响应式', () => {
  let res = 0
  let c1 = { a: 1, b: { c: 123 } };
  let rec = reactive(c1);
  effect(() => {
    res = rec.b.c
  });
  rec.b.c++
  expect(res).toBe(124)
})

test('should have multiple effect', () => {
  let res = 0
  let res2 = 0
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  effect(() => {
    res = rec.a
  });
  effect(() => {
    res2 = rec.b
  });
  rec.b++
  rec.a++
  expect(res).toBe(2)
  expect(res2).toBe(3)
})


it("should observe function call chains", () => {
  let dummy;
  const counter = reactive({ num: 0 });
  effect(() => (dummy = getNum()));

  function getNum() {
    return counter.num;
  }

  expect(dummy).toBe(0);
  counter.num = 2;
  expect(dummy).toBe(2);
});

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

// RangeError: Maximum call stack size exceeded
test('解决无限递归', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  let b
  effect(() => {
    b = ++rec.b
  })
  expect(b).toBe(3)
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

test('执行次数为一次', (done) => {
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


test('in操作符代理', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  const efn = jest.fn(() => {
    1 in rec
  })
  effect(efn)
  expect(efn).toBeCalledTimes(1)
})

test('for in操作符代理', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  const efn = jest.fn(() => {
    for (const key in rec) {
      console.log(key)
    }
  })
  effect(efn)
  rec.a++
  rec.c = 123
  // 添加新值后，会触发上述遍历会把c也遍历出来
  expect(efn).toBeCalledTimes(3)
})

test('delete 测试', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  const efn = jest.fn(() => {
    for (const key in rec) {
      console.log(key)
    }
  })

  effect(efn)
  delete rec.a
  // 添加新值后，会触发上述遍历会把c也遍历出来
  expect(efn).toBeCalledTimes(2)
})