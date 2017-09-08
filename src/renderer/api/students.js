import {axia} from '../main'
import {Student} from '../models/student'

export default{
    async getStudents () {
        return (await axia.get('student/listall')).data
    },
    async registerStudent (idNumber, cardSecret) {
        return Student((await axia.post('student/edit', {idNumber: idNumber, cardSecret: cardSecret})).data)
    }
}
