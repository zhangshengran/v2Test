
let global = new Map();
let activeEffect;
export function track(target, key) {
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
export function trigger(target, key) {
  let depsMap = global.get(target)
  let deps = depsMap.get(key)
  deps.forEach((effect) => effect())
}

export function effect(cb) {
  activeEffect = cb;
  cb();
  activeEffect = null
}
