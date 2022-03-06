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


// RangeError: Maximum call stack size exceeded
test('解决reactive无限递归', () => {
  let c1 = { a: 1, b: 2 };
  let rec = reactive(c1);
  let b
  effect(() => {
    b = ++rec.b
  })
  expect(b).toBe(3)
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