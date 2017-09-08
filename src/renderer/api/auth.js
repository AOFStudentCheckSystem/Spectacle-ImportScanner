import {UserToken} from '../models/user'
import {axia} from '../main'

export default {
    async authenticate (email, password) {
        return new UserToken((await axia.post('auth/login', {email: email, password: password})).data)
    },
    async verify () {
        return new UserToken((await axia.get('auth/verify')).data)
    }
}
