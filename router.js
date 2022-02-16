const {inject,ref} = Vue

const ROUTER_KEY='__router__'
function createRouter(){
  return new Router()
}

function useRouter(){
  Vue.inject(ROUTER_KEY)
}

function createWebHashHistory(){
  function bindEvents(fn){
    window.addEventListener('hashchange',fn)
  }
  return {
    bindEvents,
    url:window.location.hash.slice(1) || '/'
  }
}
class Router{
  constructor(options){
    this.history = options.history
    this.routes = options.routes
    this.curent.value = ref(this.history.url)

    this.history.bindEvents(()=>{
      this.current.value = window.location.hash.slice(1)
    })
  }
  install(app){
    app.provide(ROUTER_KEY,this)
  }
}