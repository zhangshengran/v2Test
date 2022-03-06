'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let global = new Map();
let activeEffect;
let activeEffectArr = [];
function track(target, key) {
    if (activeEffect) {
        let depsMap = global.get(target);
        if (!depsMap) {
            global.set(target, depsMap = new Map());
        }
        let deps = depsMap.get(key);
        if (!deps) {
            depsMap.set(key, deps = new Set());
        }
        activeEffect.deps.push(deps);
        deps.add(activeEffect);
    }
}
function trigger(target, key) {
    let depsMap = global.get(target);
    if (!depsMap)
        return;
    let deps = depsMap.get(key);
    let runDepsArr = [];
    let iterateEffects = depsMap.get(ITERATE_KEY);
    iterateEffects && iterateEffects.forEach((effectFn) => {
        if (activeEffect !== effectFn)
            runDepsArr.push(effectFn);
    });
    deps && deps.forEach((effectFn) => {
        if (activeEffect !== effectFn)
            runDepsArr.push(effectFn);
    });
    runDepsArr.forEach(effectFn => {
        if (effectFn.options.scheduler) {
            effectFn.options.scheduler(effectFn);
        }
        else {
            effectFn();
        }
    });
}
function cleanup(effectFn) {
    effectFn.deps.forEach((deps) => {
        deps.delete(activeEffect);
    });
    effectFn.deps.length = 0;
}
function effect(cb, options = {}) {
    function effectFn() {
        activeEffect = effectFn;
        activeEffectArr.push(effectFn);
        cleanup(effectFn);
        let result = cb();
        activeEffectArr.pop();
        activeEffect = activeEffectArr[activeEffectArr.length - 1];
        return result;
    }
    effectFn.options = options;
    effectFn.deps = [];
    effectFn.fn = cb;
    if (options.lazy) {
        return effectFn;
    }
    else {
        effectFn();
    }
}
const jobQueue = new Set();
let isFlushing = false;
function addAsyncJob(job) {
    jobQueue.add(job);
    return flushJob();
}
function flushJob() {
    if (isFlushing)
        return;
    isFlushing = true;
    return Promise.resolve().then(() => {
        jobQueue.forEach((job) => {
            job();
        });
    }).finally(() => {
        isFlushing = false;
    });
}

const ITERATE_KEY = Symbol();
function reactive(obj) {
    return new Proxy(obj, {
        get(target, key) {
            track(target, key);
            if (typeof target[key] === "object") {
                return reactive(target[key]);
            }
            return Reflect.get(target, key);
        },
        set(target, key, value) {
            const result = Reflect.set(target, key, value);
            trigger(target, key);
            return result;
        },
        has(target, key) {
            track(target, key);
            return Reflect.has(target, key);
        },
        ownKeys(target) {
            track(target, ITERATE_KEY);
            return Reflect.ownKeys(target);
        },
        deleteProperty(target, key) {
            let res;
            const isOwnKey = target.hasOwnProperty(key);
            if (isOwnKey) {
                res = Reflect.deleteProperty(target, key);
            }
            if (res === true && isOwnKey) {
                trigger(target, key);
            }
            return res;
        },
    });
}

function computed(fn) {
    let dirty = true;
    let value;
    const effectFn = effect(fn, {
        lazy: true, scheduler: (fn) => {
            dirty = true;
            trigger(obj, 'value');
        }
    });
    let obj = {
        get value() {
            if (dirty) {
                dirty = false;
                value = effectFn();
            }
            track(obj, 'value');
            return value;
        }
    };
    return obj;
}

function ref(value) {
    let wrapper = {
        value: value
    };
    Object.defineProperty(wrapper, '__v_isRef', { value: true });
    let react = reactive(wrapper);
    return react;
}

exports.addAsyncJob = addAsyncJob;
exports.computed = computed;
exports.effect = effect;
exports.reactive = reactive;
exports.ref = ref;
//# sourceMappingURL=mini-vue.cjs.js.map
