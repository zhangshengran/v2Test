import { reactive, effect } from './index'

test('reactive1', () => {
  let res = 0
  let c1 = { a: 1, b: { c: 123 } };
  let rec = reactive(c1);
  effect(() => {
    res = rec.a
  });
  rec.a++
  expect(res).toBe(1)
})

test('reactive对象嵌套', () => {
  let res = 0
  let c1 = { a: 1, b: { c: 123 } };
  let rec = reactive(c1);
  effect(() => {
    console.log(3333)
    res = rec.b.c
  });
  rec.b.c++
  expect(res).toBe(124)
})