/**
 * Created by dummy on 4/10/17.
 * Edited by DE_DZ_TBH on 9/6/17.
 */
import * as types from './mutation-types'
import {UserToken} from '../models/user'

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

// export const eventBrokenPersistencePlugin = store => {
//     const deserialize = JSON.parse
//     const serialize = JSON.stringify
//     return store => {
//         const raw = window.localStorage.getItem('broken_events')
//         if (raw) {
//             try {
//                 const saved = deserialize(raw)
//                 store.commit(types.SET_BROKEN_EVENTS, saved)
//             } catch (e) {
//                 console.error(e)
//             }
//         }
//
//         store.subscribe(({type}) => {
//             if (type === types.APPEND_BROKEN_EVENT) {
//                 window.localStorage.setItem('broken_events', serialize(store.state.event.broken))
//             }
//         })
//     }
// }
// export const eventStoragePatchPlugin = localStoragePatchPlugin(types.PATCH_CURRENT_EVENT, types.SET_ALL_EVENTS, (old, patch, store) => {
//     console.log(old, patch)
// })
// export const studentStoragePatchPlugin = localStoragePatchPlugin(types.PATCH_CURRENT_STUDENT, types.SET_ALL_STUDENTS, (old, patch, store) => {
//     console.log(old, patch)
// })
