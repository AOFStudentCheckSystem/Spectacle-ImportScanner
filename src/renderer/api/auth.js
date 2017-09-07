import {UserToken} from '../models/user'
import {axia} from '../main'

export default {
    async authenticate (email, password) {
        return new UserToken((await axia.post('auth/auth', {email, password})).data)
    }
}
