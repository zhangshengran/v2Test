import { reactive } from './index'
import { effect } from '../effect/index'
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

test('reactive对象嵌套', () => {
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
  let a, b
  effect(() => {
    // console.log('effect1', ++rec.a)
    a = rec.a
    console.log('outer')
    effect(() => {
      console.log('nei')
      b = rec.b
    })
  })
  expect(a).toBe(1)
  expect(b).toBe(2)
  rec.b++
  expect(a).toBe(1)
  expect(b).toBe(3)
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
    console.log('b访问')
    console.log(rec.b)
  })
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  let b
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


// test("scheduler", (done) => {
//   let c1 = { a: 1, b: 2 };
//   let rec = reactive(c1);


//   async function scheduler(fn) {
//     // Promise.resolve(() => {
//     //   fn()
//     // })
//     setTimeout(fn)

//   }

//   effect(async () => {
//     // expect(c1.a).toBe(2);
//     // done()
//   }, {
//     scheduler: scheduler
//   })
//   // expect(scheduler).not.toHaveBeenCalled();
//   console.log(1111)
//   rec.a++
//   expect(c1.a).toBe(1);
//   console.log(222)
//   expect(c1.a).toBe(2);
//   // expect(scheduler).toHaveBeenCalledTimes(1);

// })

