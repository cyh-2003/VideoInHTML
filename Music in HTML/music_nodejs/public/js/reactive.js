const targetMap = new WeakMap()
let activeEffect

function isObject(obj) {
    return typeof obj === 'object' && obj !== null
}

// 创建响应式对象进行拦截
function reactive(target){
    return new Proxy(target, {
      get(target, key, receiver) {
          let result = Reflect.get(target, key, receiver)
          track(target, key)
          if (isObject(result)) return reactive(result)
          return result
      },
        set(target, key, value, receiver) {
          let result = Reflect.set(target, key, value, receiver)
          trigger(target, key)
          return result
      }
    })
}

// 创建响应式函数,副作用函数(数据关联的函数)
function effect(fn) {
    const _effect = function () {
        activeEffect = _effect
        fn()
    }
    _effect()
}

function track(target, key){
    let depsMap = targetMap.get(target)
    if (!depsMap){
        depsMap = new Map()
        targetMap.set(target, depsMap)
    }
    let deps = depsMap.get(key)
    if (!deps){
        deps = new Set()
        depsMap.set(key, deps)
    }
    deps.add(activeEffect)
}

function trigger(target, key) {
    const depsMap = targetMap.get(target)
    if (!depsMap) return //必须在effect中触发才能访问
    const deps = depsMap.get(key)
    if (deps){
        deps.forEach(effect => effect())
    }
}

export default { reactive, effect }
