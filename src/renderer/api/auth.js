import {UserToken} from '../models/user'
import {axia} from '../main'
import {AuthenticationRequest} from '../models/requests/authentication_request'

export default {
    async authenticate (email, password) {
        return new UserToken((await axia.post('auth/auth', new AuthenticationRequest(email, password))).data)
    },
    async verify () {
        return new UserToken((await axia.post('auth/auth')).data)
    }
}
