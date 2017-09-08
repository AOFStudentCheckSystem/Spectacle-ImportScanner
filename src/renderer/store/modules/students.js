/**
 * Created by DE_DZ_TBH on 9/6/17.
 */

import {SET_STUDENTS, SET_REGISTERED_STUDENTS, SET_LAST_UPDATE} from '../mutation-types'
import api from '../../api/students'

const state = {
    students: [],
    registeredStudents: [],
    lastUpdate: null
}

const getters = {
    students (state) {
        return state.students
    },
    registeredStudents (state) {
        return state.registeredStudents
    },
    lastUpdate (state) {
        return state.lastUpdate
    }
}

const mutations = {
    [SET_STUDENTS] (state, {students}) {
        state.students = students
    },
    [SET_REGISTERED_STUDENTS] (state, students) {
        state.registeredStudents = students
    },
    [SET_LAST_UPDATE] (state, {lastUpdate}) {
        state.lastUpdate = lastUpdate
    }
}

const actions = {
    async getStudents ({commit}) {
        try {
            let students = await api.getStudents()
            commit(SET_STUDENTS, {students: students})
            commit(SET_LAST_UPDATE, {lastUpdate: new Date().getTime()})
        } catch (err) {}
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}
