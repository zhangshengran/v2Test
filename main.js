// import { reactive, effect } from "./lib/mini-vue.esm.js";
import "./lib/mini-vue.esm.js";
// function createRenderer(options) {
//   const { createElement, insert, setElementText, getParent, removeChild } = options
//   // debugger
//   function render(vnode, container) {
//     if (vnode) {
//       // 新vnode存在，和旧的一起传给 patch、
//       patch(container._vnode, vnode, container)
//     } else {

//       // 新的不存在，旧的存在，说明是unmount
//       if (container._vnode) {
//         unmountElement(container._vnode)
//       }
//     }
//   }
//   function patch(n1, n2, container) {
//     if (n1 && n1.type !== n2.type) {
//       // 如果俩个type都在，但是类型不一样，比如一个是p 一个是div，先卸载
//       unmountElement(n1)
//       n1 = null
//     }
//     const { type } = n2
//     if (type === 'string') {
//       if (!n1) {
//         // 旧vnode不存在，说明是创建并挂载
//         mountElement(n2, container)
//       } else {
//         patchElement(n1, n2)
//       }
//     } else if (type === 'object') {
//       // 是个组件
//     }

//   }
//   function patchElement(n1, n2) { }
//   function unmountElement(vnode) {
//     const el = vnode.el
//     let parent = getParent(el)
//     if (parent) removeChild(el, parent)
//   }
//   function patchProps(el: HTMLElement, key, preVal, nextVal) {
//     if (/^on/.test(key)) {
//       // 已on开头的属性，当做绑定的函数处理

//       let invoker = el._vei
//       let name = key.slice(2).toLowerCase()
//       if (nextVal) {
//         if (!invoker) {
//           invoker = el._vei = (e) => {
//             invoker.value(e)
//           }
//           // 将绑定的函数赋值给value
//           invoker.value = nextVal
//           el.addEv
//         }
//       }
//     }
//     function shouldSetAsProps(el, key, value) {
//       //  这个函数用来确认一个Props是否应该使用setAttribute设置，比如form 
//       if (key === 'form' && el.tagName === 'INPUT') return false
//       return key in el
//     }
//     // 这里还应该对class和style做专门的优化，提高性能
//     if (shouldSetAsProps(el, key, nextVal)) {
//       const type = typeof el[key]
//       if (type === 'boolean' && nextVal === '') {
//         el[key] = true
//       } else {
//         el[key] = nextVal
//       }
//     } else {
//       el.setAttribute(key, nextVal)
//     }
//   }
//   function mountElement(vnode, container) {
//     // 创建dom元素
//     let el = vnode.el = createElement(vnode.type)
//     if (vnode.props) {

//       Object.keys(vnode.props).forEach((key) => {
//         // el[key] = vnode.props[key]
//         let value = vnode.props[key]
//         patchProps(el, key, null, value)
//         el.setAttribute(key, vnode.props[key])
//       })
//     }
//     // 处理children
//     if (vnode.children) {
//       if (typeof vnode.children === 'string') {
//         setElementText(el, vnode.children)
//       } else if (Array.isArray(vnode.children)) {
//         // 循环遍历然后挂载
//         vnode.children.forEach((vnode) => {
//           mountElement(vnode, el)
//         })

//       }
//     }
//     insert(el, container)
//     container._vnode = vnode
//   }

//   return { render }
// }
// // 跨平台
// const render = createRenderer({
//   createElement(tag) {
//     return document.createElement(tag)
//   },
//   getParent(el) {
//     return el.parentElement
//   },
//   setElementText(el, text) {
//     el.textContent = text
//   },
//   removeChild(el, parent) {
//     parent.removeChild(el)
//   },
//   insert(el, parent, anchor = null) {
//     parent.insertBefore(el, anchor)
//   }
// }).render
// let rea = reactive({ a: 1 })

// let vnode = {
//   type: 'h1',
//   props: {
//     id: rea.a,
//     class: "aa",
//     onClick() {
//       console.log('click')
//     }
//   },
//   children: [
//     { type: 'h2', children: 'h2' },
//     { type: 'h3', children: 'h3' }
//   ]
// }
// effect(() => {
//   render(vnode, document.querySelector('#app'))
// })
// // setTimeout(() => {
// //   debugger
// //   render(null, document.querySelector('#app'))
// // }, 1000);