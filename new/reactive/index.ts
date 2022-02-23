
let global = new Map();
let activeEffect;
function track(target, key) {
  if (activeEffect) {
    let depsMap = global.get(target)
    if (!depsMap) {
      global.set(target, depsMap = new Map());
    }
    let deps = depsMap.get(key)
    if (!deps) {
      depsMap.set(key, deps = new Set());
    }
    deps.add(activeEffect);
  }
}
function trigger(target, key) {
  let depsMap = global.get(target)
  let deps = depsMap.get(key)
  deps.forEach((effect) => effect())
}
export function reactive(obj) {
  return new Proxy(obj, {
    get(target, key) {
      track(target, key)
      if (typeof target[key] === "object") {
        return reactive(target[key]);
      }
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      const result = Reflect.set(target, key, value);
      trigger(target, key)
      return result
    },
  });
}

export function effect(cb) {
  activeEffect = cb;
  cb();
  activeEffect = null
}


