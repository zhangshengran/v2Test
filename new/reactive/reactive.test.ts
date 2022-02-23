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

