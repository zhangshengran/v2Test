
import { reactive } from './reactive/index'
import { effect, addAsyncJob } from './effect/index'
import { computed } from './computed/index'
import { ref } from './ref/index'
// console.log(123)
// import { reactive, effect } from '@vue/reactivity'
// function render(domString, container) {
//   container.innerHTML = domString
// }
// let rea = reactive({ a: 1 })
// effect(() => {
//   render(`我是zr`, document.querySelector('#app'))
// })


// import { reactive, effect } from "./lib/mini-vue.esm.js";

function createRenderer(options) {
  const { createElement, insert, setElementText, getParent, removeChild } = options
  // debugger
  function render(vnode, container) {
    if (vnode) {
      // debugger
      // 新vnode存在，和旧的一起传给 patch、
      patch(container._vnode, vnode, container)
    } else {

      // 新的不存在，旧的存在，说明是unmount
      if (container._vnode) {
        unmountElement(container._vnode)
      }
    }
  }
  function patch(n1, n2, container) {
    if (n1 && n1.type !== n2.type) {
      // 如果俩个type都在，但是类型不一样，比如一个是p 一个是div，先卸载
      unmountElement(n1)
      n1 = null
    }
    const { type } = n2
    if (typeof type === 'string') {
      if (!n1) {
        // 旧vnode不存在，说明是创建并挂载
        mountElement(n2, container)
      } else {
        patchElement(n1, n2)
      }
    } else if (type === 'object') {
      // 是个组件
    }

  }
  function patchElement(n1, n2) {
    // 到这里边表示是同一种元素，比如都是P标签
    const el = n2.el = n1.el //把el交给新vnode
    const oldProps = n1.props
    const newProps = n2.props
    // 先更新props

    // Object.keys(newProps).forEach((key) => {
    //   if (newProps[key] !== oldProps[key]) {
    //     patchProps(el, key, oldProps, newProps)
    //   }
    // })
    patchChildren(n1, n2, el)
  }
  function patchChildren(n1, n2, container) {
    // debugger
    // 再更新children  有可能是 null string  array
    if (typeof n2.children === 'string') {
      if (Array.isArray(n1.children)) {
        // 如果旧的是数组，需要逐个卸载掉
        n1.children.forEach(child => {
          unmountElement(child)
        });
      }
      // 其他时候，不管是null还是string,都直接设置成text就行
      setElementText(container, n2.children)
    } else if (Array.isArray(n2.children)) {
      // debugger
      // 如果新child是数组
      if (Array.isArray(n1.children)) {
        // 新旧都是list  就是diff算法了
        // n1.children.forEach(child => {
        //   unmountElement(child)
        // });
        // n2.children.forEach(child => {
        //   patch(null, child, container)
        // });
        let maxIndex = 0
        const newChildren = n2.children
        const oldChildren = n1.children
        for (let i = 0; i < newChildren.length; i++) {
          let newNode = newChildren[i]
          let find = false //是否找到
          for (let j = 0; j < oldChildren.length; j++) {
            let oldNode = oldChildren[j]
            // debugger
            if (newNode.key === oldNode.key) {
              // 找到了
              newNode.el = oldNode.el
              if (j < maxIndex) {
                patch(oldNode, newNode, container)
                // 向后挪位置
                // 获取前一个元素
                const preVnode = newChildren[i - 1]
                const anchor = preVnode.el.nextSibling
                find = true
                insert(oldNode.el, container, anchor)
              } else {
                // 不用动
                maxIndex = j
              }
            }
          }
          if (find === false) {
            // 没找到
          }
        }

      } else {
        // 其他情况，不管n1 children是null还是 string、直接清空，然后挂载n2 children就可以了
        setElementText(container, '')
        n2.children.forEach(child => {
          patch(null, child, container)
        });

      }
    } else {
      // n2 children是null
      if (Array.isArray(n1.children)) {
        // 如果旧的是数组，需要逐个卸载掉
        n1.children.forEach(child => {
          unmountElement(child)
        });
      } else {
        setElementText(container, '')
      }

    }
  }
  function unmountElement(vnode) {
    const el = vnode.el
    let parent = getParent(el)
    if (parent) removeChild(el, parent)
  }
  function patchProps(el: HTMLElement, key, preVal, nextVal) {
    if (/^on/.test(key)) {
      // 已on开头的属性，当做绑定的函数处理
      // debugger
      let invokers = el._vei || (el._vei = {})
      let name = key.slice(2).toLowerCase()
      let invoker = invokers[key]
      if (nextVal) {
        if (!invoker) {

          invoker = el._vei = (e) => {
            invoker.value(e)
          }
          invokers[key] = invoker
          // 将绑定的函数赋值给value
          invoker.value = nextVal
          el.addEventListener(name, invoker)
        } else {
          // 如果invoker存在，代表这是更新
          invoker.value = nextVal
        }
      } else {
        // 新绑定的函数不存在，需要移除绑定的函数
        invoker = null
        el.removeEventListener(name, invoker)
      }
    }
    function shouldSetAsProps(el, key, value) {
      //  这个函数用来确认一个Props是否应该使用setAttribute设置，比如form 
      if (key === 'form' && el.tagName === 'INPUT') return false
      return key in el
    }
    // 这里还应该对class和style做专门的优化，提高性能
    if (shouldSetAsProps(el, key, nextVal)) {
      const type = typeof el[key]
      if (type === 'boolean' && nextVal === '') {
        el[key] = true
      } else {
        el[key] = nextVal
      }
    } else {
      el.setAttribute(key, nextVal)
    }
  }
  function mountElement(vnode, container) {
    // 创建dom元素
    let el = vnode.el = createElement(vnode.type)
    if (vnode.props) {

      Object.keys(vnode.props).forEach((key) => {
        // el[key] = vnode.props[key]
        let value = vnode.props[key]
        patchProps(el, key, null, value)

        el.setAttribute(key, vnode.props[key])
      })
    }
    // 处理children
    if (vnode.children) {
      if (typeof vnode.children === 'string') {
        setElementText(el, vnode.children)
      } else if (Array.isArray(vnode.children)) {
        // 循环遍历然后挂载
        vnode.children.forEach((vnode) => {
          mountElement(vnode, el)
        })

      }
    }
    insert(el, container)
    container._vnode = vnode

  }

  return { render }
}
// 跨平台
const { render } = createRenderer({
  createElement(tag) {
    return document.createElement(tag)
  },
  getParent(el) {
    return el.parentElement
  },
  setElementText(el, text) {
    el.textContent = text
  },
  removeChild(el, parent) {
    parent.removeChild(el)
  },
  insert(el, parent, anchor = null) {
    parent.insertBefore(el, anchor)
  }
})
let rea = reactive({ a: 1 })

let vnode = {
  type: 'h1',
  props: {
    id: rea.a,
    class: "aa",
    onClick() {
      console.log('click')
    },
    onContextMenu() {
      console.log('onContextMenu')
    }
  },
  children: [
    { type: 'h2', children: 'h2', key: 0 },
    { type: 'h3', children: 'h3', key: 1 },
    { type: 'h4', children: 'h4', key: 2 }

  ]
}

let vnode2 = {
  type: 'h1',
  props: {
    id: rea.a,
    class: "aa",

  },
  // children: '44'
  children: [
    { type: 'h4', children: 'h4', key: 2 },
    { type: 'h3', children: 'h3', key: 1 },
    { type: 'h2', children: 'h2', key: 0 }
  ]
}
effect(() => {
  // debugger
  render(vnode, document.querySelector('#app'))
})
setTimeout(() => {
  // debugger
  render(vnode2, document.querySelector('#app'))
}, 3000);