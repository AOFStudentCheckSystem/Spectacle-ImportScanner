/**
 * Created by dummy on 4/10/17.
 * Edited by DE_DZ_TBH on 9/6/17.
 */
import * as types from './mutation-types'
import {UserToken} from '../models/user'
import {Student} from '../models/student'

function localStoragePlugin (mut, preprocess) {
    const deserialize = JSON.parse
    const serialize = JSON.stringify
    return store => {
        const raw = window.localStorage.getItem(mut)
        if (raw) {
            try {
                const saved = preprocess ? preprocess(deserialize(raw)) : deserialize(raw)
                store.commit(mut, saved)
            } catch (e) {
                console.error(e)
            }
        }

        store.subscribe(({type, payload}) => {
            if (type === mut) {
                window.localStorage.setItem(type, serialize(payload))
            }
        })
    }
}

export const authStoragePlugin = localStoragePlugin(types.SET_USER_TOKEN, ({token}) => {
    return {token: token ? new UserToken(token) : token}
})

export const studentLastUpdateStoragePlugin = localStoragePlugin(types.SET_LAST_UPDATE)

export const studentsStoragePlugin = localStoragePlugin(types.SET_STUDENTS, ({students}) => {
    return {students: students.map((s) => {
        return new Student(s)
    })}
})
