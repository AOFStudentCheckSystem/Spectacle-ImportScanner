import {axia} from '../main'

export default{
    async getStudents () {
        return (await axia.get('listall')).data
    }
}
