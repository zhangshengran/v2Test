import App from './App.js'
App.render(App.setup())
// function createApp(App) {
//   return {
//     mount(container) {
//       let context = App.setup()
//       // debugger
//       let node = App.render(context)
//       // document.querySelector(container).appendChild(node)
//     }
//   }
// }

// createApp(App).mount('#app')