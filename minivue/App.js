import { reactive, effectWatch } from './reactivity/index.js'

function mountElement(vnode, element) {
  const { tag, props, children } = vnode
  // 创建元素
  let ele = document.createElement(tag)
  // 设置props
  if (props) {
    Object.keys(props).forEach((key) => {
      const value = props[key]
      ele.setAttribute(key, value)
    })
  }
  if (children) {
    if (typeof children === 'string') {
      ele.innerHTML = `${children}`
    }
    if (Array.isArray(children)) {
      // 递归mount
      children.forEach((childVnode) => {
        mountElement(childVnode, ele)
      })

    }
  }
  if (element) {
    element.appendChild(ele)
  } else {
    return ele
  }

}

function h(tag, props, children) {
  return {
    tag, props, children
  }
}
export default {
  render(context) {
    // 创建vnode
    let vNode = h('div', null, [h('div', { id: 123 }, String(context.state.ddd.aaa))])
    console.log('vNode', vNode)
    // debugger
    // 渲染vnode
    let element = mountElement(vNode)
    return element
  },
  setup() {
    let ddd = window.ddd = reactive({ aaa: 123 })
    return {
      state: { ddd }
    }
  }
}