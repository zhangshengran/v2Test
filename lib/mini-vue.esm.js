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
    function patch(n1, n2, container, anchor) {
        if (n1 && n1.type !== n2.type) {
            unmountElement(n1);
            n1 = null;
        }
        const { type } = n2;
        if (typeof type === 'string') {
            if (!n1) {
                mountElement(n2, container, anchor);
            }
            else {
                patchElement(n1, n2);
            }
        }
        else if (typeof type === 'object') {
            if (!n1) {
                mountComponent(n2, container);
            }
            else {
                patchComponent(n1, n2);
            }
        }
    }
    const taskSet = new Set();
    let doing = false;
    function queueJob(fn) {
        taskSet.add(taskSet);
        if (doing === false) {
            doing = true;
            Promise.resolve().then(() => {
                taskSet.forEach((job) => job());
            });
            taskSet.clear();
            doing = false;
        }
    }
    function mountComponent(vnode, container, anchor) {
        const componentOptions = vnode.type;
        let { render, data, beforeCreate, mounted, created, beforeMount, props: propOptions, setup } = componentOptions;
        const [props, attrs] = resolveProps(propOptions, vnode.props);
        console.log(props, attrs);
        function resolveProps(options = {}, propsData = {}) {
            let attr = {};
            let props = {};
            Object.keys(propsData).forEach((key) => {
                if (Object.keys(options).includes(key)) {
                    props[key] = propsData[key];
                }
                else {
                    attr[key] = propsData[key];
                }
            });
            return [props, attr];
        }
        const state = reactive(data());
        const instance = {
            isMounted: false,
            state,
            props: vnode.props && reactive(vnode.props),
            subTree: null
        };
        let setupRes;
        function emit(event, ...args) {
            const eventName = `on${event[0].toUpperCase()}${event.slice(1)}`;
            let handler = instance.props[eventName];
            if (handler) {
                handler(...args);
            }
        }
        const setupContexts = { attrs, emit };
        setup && (setupRes = setup(instance.props, setupContexts));
        let setupState;
        if (typeof setupRes === 'object') {
            setupState = setupRes;
        }
        else if (typeof setupRes === 'function') {
            render = setupRes;
        }
        const renderContext = new Proxy(instance, {
            get(t, k) {
                const { state, props } = t;
                if (k in state) {
                    return Reflect.get(state, k);
                }
                else if (k in props) {
                    return Reflect.get(props, k);
                }
                else if (setupState && k in setupState) {
                    return Reflect.get(setupState, k);
                }
                else {
                    console.error('err');
                }
            },
            set(t, k, v) {
                const { state, props } = t;
                if (k in state) {
                    let res = Reflect.set(state, k, v);
                    return res;
                }
                else if (k in props) {
                    let res = Reflect.set(props, k, v);
                    return res;
                }
                else if (setupState && k in setupState) {
                    let res = Reflect.set(setupState, k, v);
                    return res;
                }
            }
        });
        console.log(renderContext);
        vnode.component = instance;
        created && created.call(renderContext);
        effect(() => {
            console.log('effect??????');
            const subTree = render.call(renderContext, renderContext);
            instance.subTree = subTree;
            if (instance.isMounted === true) {
                patch(instance.subTree, subTree, container);
                instance.subTree = subTree;
            }
            else {
                beforeMount && beforeMount();
                patch(null, subTree, container);
                instance.isMounted = true;
                mounted && mounted();
            }
        }, {
            scheduler: queueJob
        });
    }
    function patchComponent(n1, n2, container, anchor) {
        const instance = n2.component = n1.component;
        instance.props;
        if (!hasPropsChange(n1.props, n2.props)) {
            resolveProps;
        }
        function hasPropsChange(oldProps, newProps) {
            const newPropsLen = Object.keys(newProps);
            const oldPropsLen = Object.keys(oldProps);
            if (oldPropsLen !== newPropsLen)
                return true;
        }
    }
    function patchElement(n1, n2) {
        const el = n2.el = n1.el;
        n1.props;
        n2.props;
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
                diffChildren(n1.children, n2.children, container);
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
    function diffChildren(oldChildren, newChildren, container) {
        let newStartIndex = 0;
        let newEndIndex = newChildren.length - 1;
        let oldStartIndex = 0;
        let oldEndIndex = oldChildren.length - 1;
        while (newStartIndex <= newEndIndex && oldStartIndex <= oldEndIndex) {
            if (!oldChildren[oldStartIndex]) {
                oldStartIndex++;
            }
            else if (newChildren[newStartIndex].key === oldChildren[oldStartIndex].key) {
                patch(oldChildren[oldStartIndex], newChildren[newStartIndex], container);
                newStartIndex++;
                oldStartIndex++;
            }
            else if (newChildren[newStartIndex].key === oldChildren[oldEndIndex].key) {
                patch(oldChildren[oldEndIndex], newChildren[newStartIndex], container);
                insert(oldChildren[oldEndIndex].el, container, oldChildren[oldStartIndex].el);
                newStartIndex++;
                oldEndIndex--;
            }
            else if (newChildren[newEndIndex].key === oldChildren[oldStartIndex].key) {
                patch(oldChildren[oldStartIndex], newChildren[newEndIndex], container);
                insert(oldChildren[oldStartIndex].el, container, oldChildren[oldEndIndex].el.nextSibling);
                newEndIndex--;
                oldStartIndex++;
            }
            else if (newChildren[newEndIndex].key === oldChildren[oldEndIndex].key) {
                patch(oldChildren[oldEndIndex], newChildren[newEndIndex], container);
                oldEndIndex--;
                newEndIndex--;
            }
            else {
                const idxInOld = oldChildren.findIndex((oldChild) => {
                    return newChildren[newStartIndex].key === oldChild.key;
                });
                if (idxInOld !== -1) {
                    patch(oldChildren[idxInOld], newChildren[newStartIndex], container);
                    insert(oldChildren[idxInOld].el, container, oldChildren[oldStartIndex].el);
                    newStartIndex++;
                    oldChildren[idxInOld] = null;
                }
                else {
                    patch(null, newChildren[newStartIndex], container, oldChildren[oldStartIndex].el);
                    newStartIndex++;
                }
            }
        }
        while (newStartIndex <= newEndIndex) {
            let preChildNode = newChildren[newStartIndex - 1];
            patch(null, newChildren[newStartIndex], container, preChildNode.el.nextSibling);
            newStartIndex++;
        }
        while (oldStartIndex <= oldEndIndex) {
            unmountElement(oldChildren[oldStartIndex]);
            oldStartIndex++;
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
    function mountElement(vnode, container, anchor) {
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
                    patch(null, vnode, container, anchor);
                });
            }
        }
        insert(el, container, anchor);
        container._vnode = vnode;
    }
    return { render };
}
function createApp(component) {
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
    function mount(el) {
        effect(() => {
            render(component, el);
        });
    }
    return { mount };
}

let rea = reactive({ a: 1 });
let myComponent2 = {
    name: 'myComponent2',
    data() {
        return { b: 222 };
    },
    setup(props, { emit }) {
        console.log('setup props', props);
        let setupRea = reactive({ gg: 'setup' });
        emit('emit', '??????emit??????');
        return { setupRea };
    },
    props: {
        ppp: {}
    },
    created() {
        console.log('created?????????myComponent2');
    },
    mounted() {
        console.log('mounted?????????myComponent2');
    },
    render() {
        return {
            type: 'div',
            children: [{ type: 'div', children: `??????myComponent2${this.b}` },
                { type: 'div', children: `??????props${this.ppp}` },
                { type: 'div', children: `??????setup??????${this.setupRea.gg}` },
            ]
        };
    }
};
let myComponents = {
    name: 'myComponents',
    data() {
        return { a: 111 };
    },
    beforeCreate() {
        console.log('beforeCreate??????');
    },
    created() {
        console.log('created?????????myComponents');
    },
    beforeMount() {
        console.log('beforeMount??????');
    },
    mounted() {
        console.log('mounted?????????myComponents');
    },
    render() {
        return {
            type: 'div',
            children: [{ type: 'div', children: `???????????????${this.a}` },
                { type: myComponent2, props: { ppp: '??????props??????', onEmit: (e) => { console.log('??????emit', e); } }, }]
        };
    }
};
({
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
        { type: 'h1', children: 'h11', key: 0 },
        { type: 'div', children: 'd1', key: 4 },
        { type: 'div', children: 'd2', key: 5 },
        { type: 'div', children: 'd3', key: 6 },
        { type: 'h3', children: 'h33', key: 2 },
        { type: 'h4', children: 'h44', key: 3 },
    ]
});
({
    type: 'h1',
    props: {
        id: rea.a,
        class: "aa",
    },
    children: [
        { type: myComponents, },
        { type: 'h2', children: 'h22', key: 1 },
        { type: 'h1', children: 'h11', key: 0 },
        { type: 'h4', children: 'h44', key: 3 },
        { type: 'h3', children: 'h33', key: 2 },
    ]
});
let vnode3 = {
    type: myComponents
};
createApp(vnode3).mount(document.querySelector('#app'));
setTimeout(() => {
}, 1000);
//# sourceMappingURL=mini-vue.esm.js.map
