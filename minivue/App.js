import { reactive, effectWatch } from './reactivity/index.js'


export default {
  render(context) {
    // debugger
    effectWatch(() => {
      let body = document.querySelector('body')
      // let node = createNode()
      // mountElement()
      body.innerHTML = ` ${String(context.state.ddd.aaa)}`
    })
  },
  setup() {
    let ddd = window.ddd = reactive({ aaa: 123 })
    return {
      state: { ddd }
    }
  }
}