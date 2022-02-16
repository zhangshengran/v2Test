let Dep;
let global = new Map();
function reactive(obj) {
  let arr = [];
  return new Proxy(obj, {
    get(target, key) {
      // console.log("触发get", target, key);
      if (Dep) {
        //  const
        if (!global.get(target)) {
          global.set(target, new Map());
        }
        if (!global.get(target).get(key)) {
          global.get(target).set(key, new Set());
        }
        global.get(target).get(key).add(Dep);
        Dep = null;
      }
      if (typeof target[key] === "object") {
        return reactive(target[key]);
      }
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      // console.log("触发set");

      if (!global.get(target)) {
        global.set(target, new Map());
      }
      if (!global.get(target).get(key)) {
        global.get(target).set(key, new Set());
      }
      global
        .get(target)
        .get(key)
        .forEach((fn) => fn());
      // arr.forEach((fn) => fn());
      return Reflect.set(target, key, value);
    },
  });
}

let c1 = { a: 1, b: { c: 123 } };
let rec = reactive(c1);

watchEffect(() => {
  console.log("c1变化" + rec.a);
});
watchEffect(() => {
  console.log("c1变化2" + rec.b.c);
});
setInterval(() => {
  rec.a++;
  rec.b.c++;
}, 1000);
function watchEffect(cb) {
  Dep = cb;
  cb();
}
