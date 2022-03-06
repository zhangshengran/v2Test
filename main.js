import { reactive, effect } from "./lib/mini-vue.esm.js";

function createRenderer(options) {
  const { createElement, insert, setElementText } = options
  function render(vnode, container) {
    if (vnode) {
      // 新vnode存在，和旧的一起传给 patch、
      patch(container.vnode, vnode, container)
    } else {
      // 新的不存在，旧的存在，说明是unmount
      if (container.vnode) {
        unmountElement()
      }
    }
  }
  function patch(n1, n2, container) {
    if (!n1) {
      // 旧vnode不存在，说明是创建并挂载
      mountElement(n2, container)
    }
  }
  function unmountElement() { }
  function mountElement(vnode, container) {
    // 创建dom元素
    let el = createElement(vnode.type)
    // 处理children
    if (vnode.children) {
      if (typeof vnode.children === 'string') {
        setElementText(el, vnode.children)
      } else if (Array.isArray(vnode.children)) {
        // 循环遍历然后挂载
      }
    }
    insert(el, container)
  }

  return { render }
}
// 跨平台
const render = createRenderer({
  createElement(tag) {
    return document.createElement(tag)
  },
  setElementText(el, text) {
    el.textContent = text
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  }
}).render
let rea = reactive({ a: 1 })

let vnode = {
  type: 'h1',
  children: 'hello'
}
effect(() => {
  render(vnode, document.querySelector('#app'))
})
setInterval(() => {
  rea.a++
}, 1000)