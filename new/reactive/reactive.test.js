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