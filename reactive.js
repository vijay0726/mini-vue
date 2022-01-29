class Dep {
  constructor() {
    this.subscribers = new Set();
  }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect);
    }
  }

  notify() {
    this.subscribers.forEach(effect => {
      effect();
    })
  }
}

let activeEffect = null;
function watchEffect(effect) {
  activeEffect = effect;
  effect();
  activeEffect = null;
}


// Map({key: value}): key是一个字符串
// WeakMap({key(对象): value}): key是一个对象, 弱引用
const targetMap = new WeakMap();

function getDep(target, key) {
  // 1.根据对象(target)取出对应的Map对象
  let depsMap = targetMap.get(target);
  if (!depsMap) {
    depsMap = new Map();
    targetMap.set(target, depsMap);
  }

  // 2.取出具体的dep对象
  let dep = depsMap.get(key);
  if (!dep) {
    dep = new Dep();
    depsMap.set(key, dep);
  }
  return dep;
}


// vue3对raw进行数据劫持，getter里收集依赖，setter里广播更新
function reactive(raw) {

  /*
    get里和set里都用到了dep，为啥不在这定义 const dep = getDep(target, key)?
    如果在这定义的话，拿不到key
  */
  return new Proxy(raw, {
    get(target, key) {
      // 拿到属性key的依赖收集器
      const dep = getDep(target, key);
      // 收集依赖
      dep.depend();
      return target[key];
    },
    set(target, key, newValue) {
      const dep = getDep(target, key);
      target[key] = newValue;
      dep.notify();
    }
  })
}

// const proxy = reactive({name: "123"})
// proxy.name = "321";


// // 测试代码
// const info = reactive({counter: 100, name: "why"});
// const foo = reactive({height: 1.88});

// // watchEffect1
// watchEffect(function () {
//   console.log("effect1:", info.counter * 2, info.name);
// })

// // watchEffect2
// watchEffect(function () {
//   console.log("effect2:", info.counter * info.counter);
// })

// // watchEffect3
// watchEffect(function () {
//   console.log("effect3:", info.counter + 10, info.name);
// })

// watchEffect(function () {
//   console.log("effect4:", foo.height);
// })

// info.counter++;
// info.name = "why";

// foo.height = 2;
