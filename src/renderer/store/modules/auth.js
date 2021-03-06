/**
 * Created by DE_DZ_TBH on 9/6/17.
 */

import * as types from '../mutation-types'
import api from '../../api/auth'
import {axia} from '../../main'
import Vue from 'vue'

const STABLE = 4

const state = {
    token: null,
    // unauthenticated or network offline !!! application working in offline mode
    // offline: true,
    // network online, can sign in !!! should only be used for sign in
    online: false,
    signingIn: false,
    consistency: STABLE
}

const getters = {
    signingIn (state) {
        return state.signingIn
    },
    authenticated (state) {
        return state.token !== null
    },
    offline (state) {
        return !state.online || state.token === null
    }
}

const mutations = {
    [types.SET_USER_TOKEN] (state, {token}) {
        const op = () => {
            axia.defaults.headers = {Authorization: token ? token.sessionKey : null}
        }
        if (axia) {
            op()
        } else {
            Vue.nextTick(() => {
                op()
            })
        }
        state.token = token
    },
    [types.SET_ONLINE] (state, {online}) {
        state.online = online
    },
    [types.SET_SIGNING_IN] (state, {signingIn}) {
        state.signingIn = signingIn
    },
    [types.ADD_CONSISTENCY] (state) {
        state.consistency = state.consistency > 9 ? 10 : state.consistency + 1
    },
    [types.CLEAR_CONSISTENCY] (state) {
        state.consistency = 0
    }
}

const actions = {
    async authenticate ({commit}, {email, password}) {
        commit(types.SET_SIGNING_IN, {signingIn: true})
        const userToken = await api.authenticate(email, password)
        if (userToken.isAuthorized('TABLET')) {
            commit(types.SET_USER_TOKEN, {token: userToken})
        } else {
            throw new Error('Unauthorized')
        }
        window.setTimeout(() => {
            commit(types.SET_SIGNING_IN, {signingIn: false})
        }, 10000)
    },
    async verify ({commit, state, dispatch}) {
        // if (!state.token) {
        //     if (!state.offline) {
        //         commit(types.SET_OFFLINE, {offline: true})
        //     }
        //     return
        // }
        try {
            const token = await api.verify()
            if (state.offline) {
                commit(types.ADD_CONSISTENCY)
                if (state.consistency > 4) {
                    commit(types.SET_USER_TOKEN, {token: token})
                    dispatch('syncLocalEvents')
                    dispatch('syncAllStudents')
                }
            }
            if (!state.online) {
                commit(types.SET_ONLINE, {online: true})
            }
        } catch (e) {
            if (e.response) {
                if (state.token && !state.signingIn) {
                    commit(types.SET_USER_TOKEN, {token: null})
                    console.error(e.request)
                    console.log('token expired')
                }
                if (!state.online) {
                    commit(types.SET_ONLINE, {online: true})
                }
            } else {
                if (!state.offline) {
                    console.error(e)
                }
            }
            if (!state.offline) {
                commit(types.SET_ONLINE, {online: false})
                commit(types.CLEAR_CONSISTENCY)
            }
        }
    }
}

export default {
    state,
    mutations,
    getters,
    actions
}
