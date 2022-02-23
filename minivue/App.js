import { reactive, effectWatch } from './reactivity/index.js'

function h(tag, props, children) {
  return {
    tag, props, children
  }
}
export default {
  render(context) {
    // 创建vnode
    let vNode = h('div', null, [h('div', { id: 123, test: 12 }, String(context.state.ddd.aaa))])
    console.log('vNode', vNode)
    return vNode
  },
  setup() {
    let ddd = window.ddd = reactive({ aaa: 123 })
    return {
      state: { ddd }
    }
  }
}