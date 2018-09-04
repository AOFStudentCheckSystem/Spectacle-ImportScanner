import {axia} from '../main'
import {Student} from '../models/student'

export default {
    async getStudents () {
        return (await axia.get('student/listall')).data.map((rawJson) => new Student(rawJson))
    },
    async registerStudent (studentId, cardSecret) {
        return new Student((await axia.put('/student/card/', {
            idNumber: studentId,
            cardSecret: cardSecret
        })).data)
    }
}
