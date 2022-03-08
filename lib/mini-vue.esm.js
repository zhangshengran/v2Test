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

function createRenderer(options) {
    const { createElement, insert, setElementText, getParent, removeChild } = options;
    function render(vnode, container) {
        if (vnode) {
            patch(container._vnode, vnode, container);
        }
        else {
            if (container._vnode) {
                unmountElement(container._vnode);
            }
        }
    }
    function patch(n1, n2, container) {
        if (n1 && n1.type !== n2.type) {
            unmountElement(n1);
            n1 = null;
        }
        const { type } = n2;
        if (typeof type === 'string') {
            if (!n1) {
                mountElement(n2, container);
            }
            else {
                patchElement(n1, n2);
            }
        }
    }
    function patchElement(n1, n2) {
        const el = n2.el = n1.el;
        const oldProps = n1.props;
        const newProps = n2.props;
        Object.keys(newProps).forEach((key) => {
            if (newProps[key] !== oldProps[key]) {
                patchProps(el, key, oldProps, newProps);
            }
        });
        patchChildren(n1, n2, el);
    }
    function patchChildren(n1, n2, container) {
        if (typeof n2.children === 'string') {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(child => {
                    unmountElement(child);
                });
            }
            setElementText(container, n2.children);
        }
        else if (Array.isArray(n2.children)) {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(child => {
                    unmountElement(child);
                });
                n2.children.forEach(child => {
                    patch(null, child, container);
                });
            }
            else {
                setElementText(container, '');
                n2.children.forEach(child => {
                    patch(null, child, container);
                });
            }
        }
        else {
            if (Array.isArray(n1.children)) {
                n1.children.forEach(child => {
                    unmountElement(child);
                });
            }
            else {
                setElementText(container, '');
            }
        }
    }
    function unmountElement(vnode) {
        const el = vnode.el;
        let parent = getParent(el);
        if (parent)
            removeChild(el, parent);
    }
    function patchProps(el, key, preVal, nextVal) {
        if (/^on/.test(key)) {
            let invokers = el._vei || (el._vei = {});
            let name = key.slice(2).toLowerCase();
            let invoker = invokers[key];
            if (nextVal) {
                if (!invoker) {
                    invoker = el._vei = (e) => {
                        invoker.value(e);
                    };
                    invokers[key] = invoker;
                    invoker.value = nextVal;
                    el.addEventListener(name, invoker);
                }
                else {
                    invoker.value = nextVal;
                }
            }
            else {
                invoker = null;
                el.removeEventListener(name, invoker);
            }
        }
        function shouldSetAsProps(el, key, value) {
            if (key === 'form' && el.tagName === 'INPUT')
                return false;
            return key in el;
        }
        if (shouldSetAsProps(el, key)) {
            const type = typeof el[key];
            if (type === 'boolean' && nextVal === '') {
                el[key] = true;
            }
            else {
                el[key] = nextVal;
            }
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
    function mountElement(vnode, container) {
        let el = vnode.el = createElement(vnode.type);
        if (vnode.props) {
            Object.keys(vnode.props).forEach((key) => {
                let value = vnode.props[key];
                patchProps(el, key, null, value);
                el.setAttribute(key, vnode.props[key]);
            });
        }
        if (vnode.children) {
            if (typeof vnode.children === 'string') {
                setElementText(el, vnode.children);
            }
            else if (Array.isArray(vnode.children)) {
                vnode.children.forEach((vnode) => {
                    mountElement(vnode, el);
                });
            }
        }
        insert(el, container);
        container._vnode = vnode;
    }
    return { render };
}
const { render } = createRenderer({
    createElement(tag) {
        return document.createElement(tag);
    },
    getParent(el) {
        return el.parentElement;
    },
    setElementText(el, text) {
        el.textContent = text;
    },
    removeChild(el, parent) {
        parent.removeChild(el);
    },
    insert(el, parent, anchor = null) {
        parent.insertBefore(el, anchor);
    }
});
let rea = reactive({ a: 1 });
let vnode = {
    type: 'h1',
    props: {
        id: rea.a,
        class: "aa",
        onClick() {
            console.log('click');
        },
        onContextMenu() {
            console.log('onContextMenu');
        }
    },
    children: [
        { type: 'h2', children: 'h2' },
        { type: 'h3', children: 'h3' }
    ]
};
let vnode2 = {
    type: 'h1',
    props: {
        id: rea.a,
        class: "aa",
    },
    children: [
        { type: 'h2', children: 'h2' },
        { type: 'h3', children: '33333' }
    ]
};
effect(() => {
    render(vnode, document.querySelector('#app'));
});
setTimeout(() => {
    render(vnode2, document.querySelector('#app'));
}, 1000);
//# sourceMappingURL=mini-vue.esm.js.map
