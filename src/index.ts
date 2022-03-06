
export { reactive } from './reactive/index'
export { effect, addAsyncJob } from './effect/index'
export { computed } from './computed/index'
export { ref } from './ref/index'
// console.log(123)
// import { reactive, effect } from '@vue/reactivity'
// function render(domString, container) {
//   container.innerHTML = domString
// }
// let rea = reactive({ a: 1 })
// effect(() => {
//   render(`我是zr`, document.querySelector('#app'))
// })