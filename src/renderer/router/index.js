import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: '/233',
            name: 'landing-page',
            component: require('@/components/LandingPage')
        },
        {
            path: '/login',
            name: 'login',
            component: require('@/components/Login')
        },
        {
            path: '/scan',
            name: 'import-scanner',
            component: require('@/components/ImportScanner')
        },
        {
            path: '*',
            redirect: '/login'
        }
    ]
})
