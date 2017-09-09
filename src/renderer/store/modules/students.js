/**
 * Created by DE_DZ_TBH on 9/6/17.
 */

import * as types from '../mutation-types'
import api from '../../api/students'

const state = {
    students: [],
    registeredStudents: [],
    replaceMarker: false,
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
    [types.SET_STUDENTS] (state, {students}) {
        state.students = students
    },
    [types.SET_NEW_RFID] (state, {rfid, idNumber}) {
        // console.log('SET_NEW_RFID', state.replaceMarker, rfid, idNumber)
        if (state.replaceMarker) {
            state.students.forEach((s) => {
                // console.log('on', s.preferredName, s.idNumber, s.cardSecret)
                if (s.idNumber === idNumber) {
                    s.cardSecret = rfid
                    // console.log('set rfid for', s.preferredName)
                } else if (s.cardSecret === rfid) {
                    s.cardSecret = null
                    // console.log('clear rfid for', s.preferredName)
                }
            })
            state.replaceMarker = false
        } else {
            let fndStu = state.students.filter((s) => {
                return s.idNumber === idNumber
            })[0]
            // console.log('set rfid for', s.preferredName)
            fndStu.cardSecret = rfid
        }
    },
    [types.SET_REGISTERED_STUDENTS] (state, {students}) {
        state.registeredStudents = students
        state.replaceMarker = true
    },
    [types.SET_REPLACE_MARKER] (state, rm) {
        state.replaceMarker = rm
    },
    [types.SET_LAST_UPDATE] (state, {lastUpdate}) {
        state.lastUpdate = lastUpdate
    },
    [types.SET_REGISTERED_STUDENTS_UPLOADING] (state, uploading) {
        state.registeredStudentsUploading = uploading
    },
    [types.SET_LAST_REGISTER] (state, lastReg) {
        state.lastRegister = lastReg
    }
}

const actions = {
    async getStudents ({commit}) {
        try {
            let students = await api.getStudents()
            commit(types.SET_STUDENTS, {students: students})
            commit(types.SET_LAST_UPDATE, {lastUpdate: new Date().getTime()})
        } catch (err) {}
    },
    async uploadRegisteredStudents ({state, commit}) {
        let ret = {success: true}
        if (!state.registeredStudentsUploading) {
            commit(types.SET_REGISTERED_STUDENTS_UPLOADING, true)
            console.log('uploadRegisteredStudents')
            try {
                while (state.registeredStudents.length) {
                    let first = state.registeredStudents[0]
                    await api.registerStudent(first.idNumber, first.cardSecret)
                    commit(types.SET_LAST_REGISTER, first)
                    commit(types.SET_NEW_RFID, {rfid: first.cardSecret, idNumber: first.idNumber})
                    // Notify the plugin to save
                    commit(types.SET_STUDENTS, {students: state.students})
                    commit(types.SET_REGISTERED_STUDENTS, {students: state.registeredStudents.slice(1)})
                }
                // Success
            } catch (err) {
                console.log(err)
                commit(types.CLEAR_CONSISTENCY)
                if (err.response && err.response.status >= 500) {
                    // Critical Error
                    ret = {success: false, errorRegistration: state.registeredStudents[0]}
                    commit(types.SET_REGISTERED_STUDENTS, {students: state.registeredStudents.slice(1)})
                } else {
                    // Token expire or no internet
                    ret = {success: false}
                }
            }
            commit(types.SET_REGISTERED_STUDENTS_UPLOADING, false)
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
