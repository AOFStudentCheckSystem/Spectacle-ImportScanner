/**
 * Created by DE_DZ_TBH on 9/6/17.
 */

import {SET_STUDENTS} from "../mutation-types"

const state = {
    students: []
}

const mutations = {
    [SET_STUDENTS](state, students) {
        state.students = students
    }
}

const actions = {
    async getStudents({commit}) {
        commit('INCREMENT_MAIN_COUNTER')
    }
}

export default {
    state,
    mutations,
    actions
}
