import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.min.css'

import {ConnectionWatcher} from './watcher/connection'

import Toaster from 'v-toaster'

// You need a specific loader for CSS files like https://github.com/webpack/css-loader
import 'v-toaster/dist/v-toaster.css'

// optional set default imeout, the default is 10000 (10 seconds).
Vue.use(Toaster, {timeout: 5000})

export const axia = axios.create({
    baseURL: 'http://api.aofactivities.com/',
    headers: {
        Authorization: ''
    },
    transformRequest: [data => {
        if (data) {
            return Object.keys(data).map(key => {
                return {key: key, value: data[key]}
            }).reduce((formData, entry) => {
                const value = entry.value
                if (value !== undefined && value !== null) {
                    switch (typeof value) {
                        case 'object':
                            formData.append(entry.key, JSON.stringify(value))
                            break
                        default:
                            formData.append(entry.key, value)
                            break
                    }
                }
                return formData
            }, new FormData())
        } else {
            return data
        }
    }],
    transformResponse: [data => {
        // iView.LoadingBar.finish()
        return data ? JSON.parse(data) : data
    }]
})

export const connectionWatcher = new ConnectionWatcher(() => {
    store.dispatch('verify')
})

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
// Vue.http = Vue.prototype.$http = axios
// axios.defaults.baseURL = 'http://api.aofactivities.com/'
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    components: {App},
    router,
    store,
    template: '<App/>'
}).$mount('#app')

router.beforeEach((to, from, next) => {
    console.log(to, from)
    next()
})
