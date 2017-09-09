/**
 * Created by DE_DZ_TBH on 9/6/17.
 */

import {
    SET_STUDENTS, SET_REGISTERED_STUDENTS, SET_LAST_UPDATE, CLEAR_CONSISTENCY, SET_REGISTERED_STUDENTS_UPLOADING,
    SET_LAST_REGISTER
} from '../mutation-types'
import api from '../../api/students'

const state = {
    students: [],
    registeredStudents: [],
    lastUpdate: null,
    registeredStudentsUploading: false,
    lastRegister: null
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
    },
    lastRegister (state) {
        return state.lastRegister
    }
}

const mutations = {
    [SET_STUDENTS] (state, {students}) {
        state.students = students
    },
    [SET_REGISTERED_STUDENTS] (state, {students}) {
        state.registeredStudents = students
    },
    [SET_LAST_UPDATE] (state, {lastUpdate}) {
        state.lastUpdate = lastUpdate
    },
    [SET_REGISTERED_STUDENTS_UPLOADING] (state, uploading) {
        state.registeredStudentsUploading = uploading
    },
    [SET_LAST_REGISTER] (state, lastReg) {
        state.lastRegister = lastReg
    }
}

const actions = {
    async getStudents ({commit}) {
        try {
            let students = await api.getStudents()
            commit(SET_STUDENTS, {students: students})
            commit(SET_LAST_UPDATE, {lastUpdate: new Date().getTime()})
        } catch (err) {}
    },
    async uploadRegisteredStudents ({state, commit}) {
        let ret = {success: true}
        if (!state.registeredStudentsUploading) {
            commit(SET_REGISTERED_STUDENTS_UPLOADING, true)
            console.log('uploadRegisteredStudents')
            try {
                while (state.registeredStudents.length) {
                    let first = state.registeredStudents[0]
                    await api.registerStudent(first.idNumber, first.cardSecret)
                    commit(SET_LAST_REGISTER, first)
                    commit(SET_REGISTERED_STUDENTS, {students: state.registeredStudents.slice(1)})
                }
                // Success
            } catch (err) {
                console.log(err)
                commit(CLEAR_CONSISTENCY)
                if (err.response && err.response.status >= 500) {
                    // Critical Error
                    ret = {success: false, errorRegistration: state.registeredStudents[0]}
                    commit(SET_REGISTERED_STUDENTS, {students: state.registeredStudents.slice(1)})
                } else {
                    // Token expire or no internet
                    ret = {success: false}
                }
            }
            commit(SET_REGISTERED_STUDENTS_UPLOADING, false)
        }
        return ret
    }
}

export default {
    state,
    getters,
    mutations,
    actions
}
