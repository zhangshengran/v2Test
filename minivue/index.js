import App from './App.js'
import { reactive, effectWatch } from './reactivity/index.js'
// App.render(App.setup())
function createApp(App) {
  return {
    mount(container) {
      let context = App.setup()
      // debugger
      effectWatch(() => {
        let rootEle = document.querySelector(container)
        rootEle.innerHTML = ``
        let element = App.render(context)
        rootEle.appendChild(element)
      })

    }
  }
}

createApp(App).mount('#app')