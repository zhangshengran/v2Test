import { reactive, effectWatch } from '../reactivity/index.js'
// App.render(App.setup())


function mountElement(vnode, element) {
  const { tag, props, children } = vnode
  // 创建元素
  let ele = vnode.el = document.createElement(tag)
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


export function createApp(App) {
  return {
    mount(container) {
      let context = App.setup()
      // debugger
      let isMounted = false
      let preSubTree
      effectWatch(() => {
        let rootEle = document.querySelector(container)
        rootEle.innerHTML = ``

        let subTree = App.render(context)
        preSubTree = subTree
        // 渲染vnode
        if (!isMounted) {
          // 第一次
          isMounted = true
          let element = mountElement(subTree)
          rootEle.appendChild(element)
        } else {
          let subTree = App.render(context)
          diff(preSubTree, subTree)
        }

      })

    }
  }
}