
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
  function patch(n1, n2, container, anchor?) {

    if (n1 && n1.type !== n2.type) {
      // 如果俩个type都在，但是类型不一样，比如一个是p 一个是div，先卸载
      unmountElement(n1)
      n1 = null
    }
    const { type } = n2
    if (typeof type === 'string') {
      if (!n1) {
        // 旧vnode不存在，说明是创建并挂载
        mountElement(n2, container, anchor)
      } else {
        patchElement(n1, n2)
      }
    } else if (typeof type === 'object') {
      // 是个组件
      if (!n1) {
        mountComponent(n2, container, anchor)
      } else {
        patchComponent(n1, n2, container, anchor)
      }
    }

  }
  const taskSet = new Set()
  let doing = false
  function queueJob(fn) {
    taskSet.add(taskSet)

    if (doing === false) {
      doing = true
      Promise.resolve().then(() => {
        taskSet.forEach((job: any) => job())
      })
      taskSet.clear()
      doing = false
    }

  }
  function mountComponent(vnode, container, anchor) {
    const componentOptions = vnode.type
    const { render, data, beforeCreate, mounted, created, beforeMount } = componentOptions
    const state = reactive(data())
    beforeCreate && beforeCreate()
    const instance = {
      // 组件实例
      isMounted: false,
      state,
      subTree: null
    }
    vnode.component = instance
    created && created()
    effect(() => {
      console.log('effect执行')
      // 上面每次state变化，则effect重新执行，更新视图
      const subTree = render.call(state, state)
      instance.subTree = subTree
      if (instance.isMounted === true) {
        patch(instance.subTree, subTree, container)
        instance.subTree = subTree
      } else {
        beforeMount && beforeMount()
        patch(null, subTree, container)
        instance.isMounted = true
        mounted && mounted()
      }
    }, {
      scheduler: queueJob //多次同步更新，只执行最后一次
    })
    // state.a++
    // state.a++
  }

  function patchComponent(n1, n2, container, anchor) { }
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
        // debugger
        diffChildren(n1.children, n2.children, container)
        // 新旧都是list  就是diff算法了
        // n1.children.forEach(child => {
        //   unmountElement(child)
        // });
        // n2.children.forEach(child => {
        //   patch(null, child, container)
        // });
        // let maxIndex = 0
        // const newChildren = n2.children
        // const oldChildren = n1.children
        // for (let i = 0; i < newChildren.length; i++) {
        //   let newNode = newChildren[i]
        //   // debugger
        //   let find = false //是否找到
        //   for (let j = 0; j < oldChildren.length; j++) {
        //     let oldNode = oldChildren[j]
        //     // debugger
        //     if (newNode.key === oldNode.key) {
        //       // 找到了
        //       // debugger
        //       newNode.el = oldNode.el
        //       find = true
        //       if (j < maxIndex) {
        //         patch(oldNode, newNode, container)
        //         // 向后挪位置
        //         // 获取前一个元素
        //         const preVnode = newChildren[i - 1]
        //         const anchor = preVnode.el.nextSibling

        //         insert(oldNode.el, container, anchor)
        //       } else {
        //         // 不用动
        //         maxIndex = j
        //       }
        //     }
        //   }
        //   if (find === false) {
        //     // 没找到
        //     // debugger
        //     let preNode = newChildren[i - 1]
        //     if (preNode) {
        //       // 有前一个节点，获取，然后后边插入
        //       patch(null, newNode, container, preNode.el.nextSibling)
        //     } else {
        //       // 是第一个节点
        //       patch(null, newNode, container, oldChildren[0].el.nextSibling)

        //     }
        //   }
        // }
        // // 得把剩下的旧的都卸载掉
        // for (let j = 0; j < oldChildren.length; j++) {
        //   let oldchild = oldChildren[j]
        //   let find = newChildren.find(newChild => newChild.key === oldchild.key)
        //   if (!find) unmountElement(oldchild)
        // }

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
  function diffChildren(oldChildren, newChildren, container) {
    // 双端diff
    // 四个索引
    let newStartIndex = 0
    let newEndIndex = newChildren.length - 1
    let oldStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    while (newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
      if (!oldChildren[oldStartIndex]) {
        oldStartIndex++
      }
      else if (newChildren[newStartIndex].key === oldChildren[oldStartIndex].key) {
        // debugger
        // 俩个头一直，不需要挪位置，只需要patch
        patch(oldChildren[oldStartIndex], newChildren[newStartIndex], container)
        newStartIndex++
        oldStartIndex++

      } else if (newChildren[newStartIndex].key === oldChildren[oldEndIndex].key) {
        // 新首，旧尾，说明旧的最后一个节点，现在变成了最前
        patch(oldChildren[oldEndIndex], newChildren[newStartIndex], container)

        insert(oldChildren[oldEndIndex].el, container, oldChildren[oldStartIndex].el)
        newStartIndex++
        oldEndIndex--
      }
      else if (newChildren[newEndIndex].key === oldChildren[oldStartIndex].key) {
        // 新尾，旧首
        patch(oldChildren[oldStartIndex], newChildren[newEndIndex], container)

        insert(oldChildren[oldStartIndex].el, container, oldChildren[oldEndIndex].el.nextSibling)
        newEndIndex--
        oldStartIndex++
      } else if (newChildren[newEndIndex].key === oldChildren[oldEndIndex].key) {
        patch(oldChildren[oldEndIndex], newChildren[newEndIndex], container)
        oldEndIndex--
        newEndIndex--
      } else {
        // 如果上面四个节点互相没有找到，则遍历旧的进行查找新队列的第一个头节点
        const idxInOld = oldChildren.findIndex((oldChild) => {
          return newChildren[newStartIndex].key === oldChild.key
        })
        if (idxInOld !== -1) {
          patch(oldChildren[idxInOld], newChildren[newStartIndex], container)
          insert(oldChildren[idxInOld].el, container, oldChildren[oldStartIndex].el)
          newStartIndex++
          oldChildren[idxInOld] = null
        } else {
          // 还没找到，新建
          // debugger
          patch(null, newChildren[newStartIndex], container, oldChildren[oldStartIndex].el)
          newStartIndex++
        }
      }
    }
    // 新增那些新队列中没处理到的新节点
    while (newStartIndex <= newEndIndex) {
      let preChildNode = newChildren[newStartIndex - 1]
      patch(null, newChildren[newStartIndex], container, preChildNode.el.nextSibling)
      newStartIndex++
    }
    // 卸载那些新队列里边没有的旧节点
    while (oldStartIndex <= oldEndIndex) {
      unmountElement(oldChildren[oldStartIndex])
      oldStartIndex++
    }
  }
  function unmountElement(vnode) {
    const el = vnode.el
    let parent = getParent(el)
    if (parent) removeChild(el, parent)
  }
  function patchProps(el: HTMLElement extends any, key, preVal, nextVal) {
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
  function mountElement(vnode, container, anchor?) {
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
          mountElement(vnode, el, anchor)
        })

      }
    }
    insert(el, container, anchor)
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
let myComponents = {
  name: 'myComponents',
  data() {
    return { a: 111 }
  },
  beforeCreate() {
    console.log('beforeCreate钩子')
  },
  created() {
    console.log('created钩子')
  },
  beforeMount() {
    console.log('beforeMount钩子')
  },
  mounted() {
    console.log('mounted钩子')
  },
  render() {
    return {
      type: 'div',
      children: '我是子组件' + this.a
    }
  }
}
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


    { type: 'h1', children: 'h11', key: 0 },

    // { type: 'h2', children: 'h22', key: 1 },
    { type: 'div', children: 'd1', key: 4 },
    { type: 'div', children: 'd2', key: 5 },
    { type: 'div', children: 'd3', key: 6 },
    { type: 'h3', children: 'h33', key: 2 },
    { type: 'h4', children: 'h44', key: 3 },

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
    { type: myComponents, },
    { type: 'h2', children: 'h22', key: 1 },
    { type: 'h1', children: 'h11', key: 0 },
    // { type: 'div', children: 'd1', key: 4 },
    // { type: 'div', children: 'd2', key: 5 },
    // { type: 'div', children: 'd3', key: 6 },
    { type: 'h4', children: 'h44', key: 3 },

    { type: 'h3', children: 'h33', key: 2 },

    // { type: 'h5', children: 'h5', key: 3 },

    // { type: 'h4', children: 'h4', key: 2 },

    // { type: 'h3', children: 'h3', key: 1 },
    // { type: 'h2', children: 'h2', key: 0 }
  ]
}
let vnode3 = {
  type: myComponents
}
effect(() => {
  // debugger
  render(vnode3, document.querySelector('#app'))
})
// setTimeout(() => {
//   // debugger
//   render(vnode2, document.querySelector('#app'))
// }, 1000);