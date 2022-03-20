import { reactive } from './reactive'
import { createApp } from './vueRunTime'

let rea = reactive({ a: 1 })

let myComponent2 = {
  name: 'myComponent2',
  data() {
    return { b: 222 }
  },
  created() {
    console.log('created钩子：myComponent2')
  },
  mounted() {
    console.log('mounted钩子：myComponent2')
  },
  render() {
    return {
      type: 'div',
      children: `我是myComponent2${this.b}`
    }
  }
}


let myComponents = {
  name: 'myComponents',
  data() {
    return { a: 111 }
  },
  beforeCreate() {
    console.log('beforeCreate钩子')
  },
  created() {
    console.log('created钩子：myComponents')
  },
  beforeMount() {
    console.log('beforeMount钩子')
  },
  mounted() {
    console.log('mounted钩子：myComponents')
  },
  render() {
    return {
      type: 'div',
      children: [{ type: 'div', children: `我是子组件${this.a}` }, { type: myComponent2 }]
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

createApp(vnode3).mount(document.querySelector('#app'))
// setTimeout(() => {
//   // debugger
//   render(vnode2, document.querySelector('#app'))
// }, 1000);