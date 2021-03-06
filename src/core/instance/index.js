import { initMixin } from './init'
import { stateMixin } from './state'
import { renderMixin } from './render'
import { eventsMixin } from './events'
import { lifecycleMixin } from './lifecycle'
import { warn } from '../util/index'

// 真正的vue是一个函数
function Vue(options) {
    if (process.env.NODE_ENV !== 'production' &&
        !(this instanceof Vue)
    ) {
        warn('Vue is a constructor and should be called with the `new` keyword')
    }
    this._init(options)
}

// 引入五个方法分别执行，传入构造函数Vue
initMixin(Vue) // 往Vue原型里加_init方法在构造函数里面调用了
stateMixin(Vue)
eventsMixin(Vue) // on once off emit
lifecycleMixin(Vue) // update forceUpdate destroy
renderMixin(Vue) // $nextTick _render

export default Vue
