/* @flow */

import { toArray } from '../util/index'

// 插件时使用Vue.use(Vuex)会调用相应的install方法
export function initUse(Vue: GlobalAPI) {
    Vue.use = function(plugin: Function | Object) {
        const installedPlugins = (this._installedPlugins || (this._installedPlugins = []))
        if (installedPlugins.indexOf(plugin) > -1) {
            return this
        }

        // additional parameters
        const args = toArray(arguments, 1)
        args.unshift(this)
        if (typeof plugin.install === 'function') {
            plugin.install.apply(plugin, args)
        } else if (typeof plugin === 'function') {
            plugin.apply(null, args)
        }
        installedPlugins.push(plugin)
        return this
    }
}
