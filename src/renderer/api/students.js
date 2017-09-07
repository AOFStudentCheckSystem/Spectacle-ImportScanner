export default {
    async getStudents () {
        return (await this.http.get('listall')).data
    }
}