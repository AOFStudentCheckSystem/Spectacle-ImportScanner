/**
 * Created by DE_DZ_TBH on 9/6/17.
 */

import {SET_STUDENTS} from '../mutation-types'
import api from '../../api/students'

const state = {
    students: []
}

const mutations = {
    [SET_STUDENTS] (state, students) {
        state.students = students
    }
}

const actions = {
    async getStudents ({commit}) {
        try {
            let students = await api.getStudents()
            commit(SET_STUDENTS, students)
        } catch (err) {

        }
    }
}

export default {
    state,
    mutations,
    actions
}
