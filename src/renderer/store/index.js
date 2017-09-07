import Vuex from 'vuex'
import Vue from 'vue'

import modules from './modules'
import * as plugins from './plugins'

Vue.use(Vuex)

export default new Vuex.Store({
    modules,
    plugins: Object.keys(plugins).map((key) => plugins[key]),
    strict: process.env.NODE_ENV !== 'production'
})
