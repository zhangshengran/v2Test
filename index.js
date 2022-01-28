import {Vue} from './vue.js'
let vue = new Vue({
  el: '#app',
  data: {
    text1: 'text1',
    text2: 'text2'
  },
  render() {
    console.log('render')
  }
})
window.vue = vue
