import Vue from 'vue'
import axios from 'axios'

import App from './App'
import router from './router'
import store from './store'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'font-awesome/css/font-awesome.min.css'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
axios.defaults.baseURL = 'http://api.aofactivities.com/'
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
    components: { App },
    router,
    store,
    template: '<App/>'
}).$mount('#app')

router.beforeEach((to, from, next) => {
    console.log(to, from)
    next()
})
