/* @flow */

// 创建一个空对象这个对象不可被扩展、改写
export const emptyObject = Object.freeze({})

// These helpers produce better VM code in JS engines due to their
// explicitness and function inlining.
// 未定义
export function isUndef(v: any): boolean %checks {
    return v === undefined || v === null
}

// 定义了
export function isDef(v: any): boolean %checks {
    return v !== undefined && v !== null
}

// 是否为真
export function isTrue(v: any): boolean %checks {
    return v === true
}

// 是否为假
export function isFalse(v: any): boolean %checks {
    return v === false
}

/**
 * Check if value is primitive.
 */
// 是否为原始类型
export function isPrimitive(value: any): boolean %checks {
    return (
        typeof value === 'string' ||
        typeof value === 'number' ||
        // $flow-disable-line
        typeof value === 'symbol' ||
        typeof value === 'boolean'
    )
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 */
// 是否为对象
export function isObject(obj: mixed): boolean %checks {
    return obj !== null && typeof obj === 'object'
}

/**
 * Get the raw type string of a value, e.g., [object Object].
 */
const _toString = Object.prototype.toString

// 返回给定变量的原始类型字符串
export function toRawType(value: any): string {
    return _toString.call(value).slice(8, -1)
}

/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 */
// 是否是纯对象
export function isPlainObject(obj: any): boolean {
    return _toString.call(obj) === '[object Object]'
}

// 是否是正则对象
export function isRegExp(v: any): boolean {
    return _toString.call(v) === '[object RegExp]'
}

/**
 * Check if val is a valid array index.
 */
// 判断给定变量的值是否是有效的数组索引
export function isValidArrayIndex(val: any): boolean {
    const n = parseFloat(String(val))
    return n >= 0 && Math.floor(n) === n && isFinite(val)
}

// 是否是promise对象
export function isPromise(val: any): boolean {
    return (
        isDef(val) &&
        typeof val.then === 'function' &&
        typeof val.catch === 'function'
    )
}

/**
 * Convert a value to a string that is actually rendered.
 */
// 转换成字符串
export function toString(val: any): string {
    return val == null ?
        '' :
        Array.isArray(val) || (isPlainObject(val) && val.toString === _toString) ?
        JSON.stringify(val, null, 2) :
        String(val)
}

/**
 * Convert an input value to a number for persistence.
 * If the conversion fails, return original string.
 */
//  string 类型的值转换为 number 类型并返回
export function toNumber(val: string): number | string {
    const n = parseFloat(val)
    return isNaN(n) ? val : n
}

/**
 * Make a map and return a function for checking if a key
 * is in that map.
 */
// makeMap 函数首先根据一个字符串生成一个 map，然后根据该 map 产生一个新函数，新函数接收一个字符串参数作为 key，如果这个 key 在 map 中则返回 true，否则返回 undefined
export function makeMap(
    str: string,
    expectsLowerCase ?: boolean
): (key: string) => true | void {
    const map = Object.create(null)
    const list: Array<string> = str.split(',')
    for (let i = 0; i < list.length; i++) {
        map[list[i]] = true
    }
    return expectsLowerCase ?
        val => map[val.toLowerCase()] :
        val => map[val]
}

/**
 * Check if a tag is a built-in tag.
 */
// 检查是否是内置的标签
export const isBuiltInTag = makeMap('slot,component', true)

/**
 * Check if an attribute is a reserved attribute.
 */
// 检查给定字符串是否是内置的属性
export const isReservedAttribute = makeMap('key,ref,slot,slot-scope,is')

/**
 * Remove an item from an array.
 */
// 从数组中移除指定元素
export function remove(arr: Array<any>, item: any): Array<any> | void {
    if (arr.length) {
        const index = arr.indexOf(item)
        if (index > -1) {
            return arr.splice(index, 1)
        }
    }
}

/**
 * Check whether an object has the property.
 */
const hasOwnProperty = Object.prototype.hasOwnProperty
// 检查对象 obj 是否具有属性值key
export function hasOwn(obj: Object | Array<*> , key: string): boolean {
    return hasOwnProperty.call(obj, key)
}

/**
 * Create a cached version of a pure function.
 */
// 为一个纯函数创建一个缓存版本的函数
export function cached <F: Function> (fn: F): F {
    const cache = Object.create(null)
    return (function cachedFn(str: string) {
        const hit = cache[str]
        return hit || (cache[str] = fn(str))
    }: any)
}

/**
 * Camelize a hyphen-delimited string.
 */
const camelizeRE = /-(\w)/g
// 连字符转驼峰
export const camelize = cached((str: string): string => {
    return str.replace(camelizeRE, (_, c) => c ? c.toUpperCase() : '')
})

/**
 * Capitalize a string.
 */
// 首字母大写
export const capitalize = cached((str: string): string => {
    return str.charAt(0).toUpperCase() + str.slice(1)
})

/**
 * Hyphenate a camelCase string.
 */
const hyphenateRE = /\B([A-Z])/g
// 驼峰转连字符
export const hyphenate = cached((str: string): string => {
    return str.replace(hyphenateRE, '-$1').toLowerCase()
})

/**
 * Simple bind polyfill for environments that do not support it,
 * e.g., PhantomJS 1.x. Technically, we don't need this anymore
 * since native bind is now performant enough in most browsers.
 * But removing it would mean breaking code that was able to run in
 * PhantomJS 1.x, so this must be kept for backward compatibility.
 */

/* istanbul ignore next */
function polyfillBind(fn: Function, ctx: Object): Function {
    function boundFn(a) {
        const l = arguments.length
        return l ?
            l > 1 ?
            fn.apply(ctx, arguments) :
            fn.call(ctx, a) :
            fn.call(ctx)
    }

    boundFn._length = fn.length
    return boundFn
}

function nativeBind(fn: Function, ctx: Object): Function {
    return fn.bind(ctx)
}

// bind函数
export const bind = Function.prototype.bind ?
    nativeBind :
    polyfillBind

/**
 * Convert an Array-like object to a real Array.
 */
// 将类数组对象转换为数组
export function toArray(list: any, start?: number): Array<any> {
    start = start || 0
    let i = list.length - start
    const ret: Array<any> = new Array(i)
    while (i--) {
        ret[i] = list[i + start]
    }
    return ret
}

/**
 * Mix properties into target object.
 */
// 对象扩展
export function extend(to: Object, _from: ? Object): Object {
    for (const key in _from) {
        to[key] = _from[key]
    }
    return to
}

/**
 * Merge an Array of Objects into a single Object.
 */
// 将数组转对象
export function toObject(arr: Array<any> ): Object {
    const res = {}
    for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
            extend(res, arr[i])
        }
    }
    return res
}

/* eslint-disable no-unused-vars */

/**
 * Perform no operation.
 * Stubbing args to make Flow happy without leaving useless transpiled code
 * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
 */
// 空函数
export function noop(a?: any, b?: any, c?: any) {}

/**
 * Always return false.
 */
// 始终返回 false 的函数
export const no = (a?: any, b?: any, c?: any) => false

/* eslint-enable no-unused-vars */

/**
 * Return the same value.
 */
// 输入和返回值一样的纯函数
export const identity = (_: any) => _

/**
 * Generate a string containing static keys from compiler modules.
 */
// 根据编译器(compiler)的 modules 生成一个静态键字符串
export function genStaticKeys(modules: Array<ModuleOptions> ): string {
    return modules.reduce((keys, m) => {
        return keys.concat(m.staticKeys || [])
    }, []).join(',')
}

/**
 * Check if two values are loosely equal - that is,
 * if they are plain objects, do they have the same shape?
 */
// 检查两个值是否相等
export function looseEqual(a: any, b: any): boolean {
    if (a === b) return true
    const isObjectA = isObject(a)
    const isObjectB = isObject(b)
    if (isObjectA && isObjectB) {
        try {
            const isArrayA = Array.isArray(a)
            const isArrayB = Array.isArray(b)
            if (isArrayA && isArrayB) {
                return a.length === b.length && a.every((e, i) => {
                    return looseEqual(e, b[i])
                })
            } else if (a instanceof Date && b instanceof Date) {
                return a.getTime() === b.getTime()
            } else if (!isArrayA && !isArrayB) {
                const keysA = Object.keys(a)
                const keysB = Object.keys(b)
                return keysA.length === keysB.length && keysA.every(key => {
                    return looseEqual(a[key], b[key])
                })
            } else {
                /* istanbul ignore next */
                return false
            }
        } catch (e) {
            /* istanbul ignore next */
            return false
        }
    } else if (!isObjectA && !isObjectB) {
        return String(a) === String(b)
    } else {
        return false
    }
}

/**
 * Return the first index at which a loosely equal value can be
 * found in the array (if value is a plain object, the array must
 * contain an object of the same shape), or -1 if it is not present.
 */
// 返回 val 在 arr 中的索引
export function looseIndexOf(arr: Array<mixed> , val: mixed): number {
    for (let i = 0; i < arr.length; i++) {
        if (looseEqual(arr[i], val)) return i
    }
    return -1
}

/**
 * Ensure a function is called only once.
 */
// 确保回调函数只被调用一次
export function once(fn: Function): Function {
    let called = false
    return function() {
        if (!called) {
            called = true
            fn.apply(this, arguments)
        }
    }
}
