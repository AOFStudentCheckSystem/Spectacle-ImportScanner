<template>
    <div class='container-fluid'>
        <div class="align-vertical col-xs-3">
            <div class='row'>
                <div class='col-xs-12'>
                    <h4>Last uploaded: {{lastRegisterName}}</h4>
                </div>
                <div class='col-xs-12'>
                    <p>These are {{registeredStudents.length}} unuploaded registrations.</p>
                    <button @click="uploadStudents" class='btn btn-block btn-primary' :disabled="!registeredStudents.length || offline">
                        {{registeredStudents.length?'Manually upload registrations':'No unuploaded registrations'}}
                    </button>
                    <button @click="exportFile(registeredStudents)" class='btn btn-block btn-warning' :disabled="!registeredStudents.length">
                        Export unuploaded registrations
                    </button>
                </div>
                <div class='col-xs-12'>
                    <br>
                    <br>
                    <p>Broken registrations will NOT be kept after window is closed!</p>
                    <p>These are {{failedRegisters.length}} broken registrations.</p>
                    <button @click="exportFile(failedRegisters)" class='btn btn-block btn-warning' :disabled="!failedRegisters.length">
                        Export broken registrations
                    </button>
                </div>
            </div>
        </div>
        <div class="align-vertical col-xs-5">
            <div class='panel' id='loginPanel'>
                <div class='panel-heading'>
                    <h3 align='center'>
                        You are {{offline ? 'Offline' : 'Online'}}
                    </h3>
                    <h4 align='center' v-if="!authenticated">
                        <router-link :to="{name: 'login'}">Please click here to login again!</router-link>
                    </h4>
                </div>
                <div class='panel-body'>
                    <form>
                        <div class='input-group' @keyup.enter="register">
                            <label class='input-group-addon' for='barcode'>Barcode</label>
                            <input type='text' id='barcode' class='form-control' v-model='barcode'
                                   placeholder='' required v-focus :disabled="wait">
                        </div><!-- Username Field-->
                        <br>
                        <div class='input-group'>
                            <label class='input-group-addon' for='rfid'>Card RFID</label>
                            <input type='text' id='rfid' class='form-control' v-model='rfid' disabled
                                   placeholder='' required>
                        </div><!-- rfid Field-->
                        <div class='row'>
                            <div class='col-xs-12'>
                                <h5>Scan card and enter barcode to register.</h5>
                                <h5 v-if="rfid && rfidOwner">{{displayName(rfidOwner)}} owns this card.</h5>
                                <h5 v-if="rfid && !rfidOwner">No one owns this card yet.</h5>
                                <br>
                                <h5>Last student list update: {{lastUpdateTime}}</h5>
                                <h5>Click the refresh button on the right to update.</h5>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="col-xs-4">
            <div class='input-group'>
                <input type='text' class='form-control' v-model='search'
                       placeholder='search for firstname, lastname or nickname' required>
                <span class="input-group-btn">
                    <button class="btn btn-default" type="button" @click="getStudents"><i class="fa fa-refresh"></i></button>
                </span>
            </div>
            <ul class="list-group list-group-height" v-if="displaying.length <= maxDisplay">
                <li class="list-group-item" :class="{'active': selectedIndex === index}" v-for="(student, index) in displaying" @click="selectStudent(index)">
                    {{displayName(student)}}
                </li>
            </ul>
            <h4 class="list-group-height" v-else>Please type more letters</h4>
            <div class="panel panel-default">
                <div class="panel-body">
                    <div v-if="selectedIndex === -1">
                        <p>何でもない</p>
                        <p>什么都没有</p>
                        <p>Nothing here</p>
                    </div>
                    <div class="detail" v-else>
                        <p>{{displayName(magicStudent)}}</p>
                        <p>Barcode:{{magicStudent.idNumber}}</p>
                        <button class='btn btn-block btn-primary' @click="barcode = magicStudent.idNumber; register()">
                            Insert Barcode
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {SmartCardController} from '../smartcard/smartcard'
    import {mapGetters, mapActions, mapMutations} from 'vuex'
    import moment from 'moment'
    import fs from 'fs'

    export default {
        name: 'import-scanner',
        data () {
            return {
                barcode: '',
                rfid: '',
                smart: null,
                errorCallbackUnsubscriber: null,
                connectCallbackUnsubscriber: null,
                search: '',
                selectedIndex: -1,
                maxDisplay: 25,
                wait: false,
                failedRegisters: [],
                log: []
            }
        },
        computed: {
            displaying () {
                this.selectedIndex = -1
                return this.students.filter((s) => {
                    let sr = this.search.toUpperCase()
//                    if (!sr || !s.lastName || !s.firstName || !s.preferredName) {
//                        console.warn('a', sr, s.lastName, s.firstName, s.preferredName)
//                    }
                    return this.find(s.lastName, sr) || this.find(s.firstName, sr) || this.find(s.preferredName, sr)
                })
            },
            magicStudent () {
                try {
                    return this.students[this.selectedIndex]
                } catch (err) {
                    return null
                }
            },
            ...mapGetters([
                'registeredStudents',
                'authenticated',
                'students',
                'lastUpdate',
                'lastRegister',
                'offline'
            ]),
            lastUpdateTime () {
                return this.lastUpdate ? moment(this.lastUpdate).fromNow() : 'Never'
            },
            lastRegisterName () {
                console.log('lastRegister', this.lastRegister)
                return this.lastRegister ? this.displayName(this.lastRegister) : 'None'
            },
            rfidOwner () {
                let stus = this.students.filter((s) => {
                    return s.cardSecret && this.rfid.toUpperCase() === s.cardSecret.toUpperCase()
                })
                return stus.length ? stus[0] : null
            }
        },
        methods: {
            async register () {
                if (this.rfid === '') {
                    console.log('Wait')
                    this.wait = true
                } else {
                    console.log('注册')
                    this.sendRegister()
                }
            },
            find (orig, search) {
                if (!orig || !search) {
                    return false
                }
                return orig.toUpperCase().indexOf(search) >= 0
            },
            sendRegister () {
                let newStus = this.students.filter((s) => {
                    return this.barcode === s.idNumber
                })
                if (!newStus.length) {
                    // Student Not Found
                    console.error('Student Not Found With Barcode')
                    return
                }
                let newStu = JSON.parse(JSON.stringify(newStus[0]))
                newStu.cardSecret = this.rfid.toUpperCase()
                this.log.push(newStu)
                this.log[this.log.length - 1].time = moment().format('')
                this.SET_REGISTERED_STUDENTS({students: this.registeredStudents.concat(newStu), replaceMarker: !!this.rfidOwner})
                this.barcode = ''
            },
            selectStudent (index) {
                this.selectedIndex = index
            },
            async uploadStudents () {
                let r = await this.uploadRegisteredStudents()
                if (!r.success && r.errorRegistration) {
                    this.failedRegisters.push(r.errorRegistration)
                }
            },
            exportFile (sth) {
                this.$electron.remote.dialog.showSaveDialog({
                    properties: [
                        'openFile', 'createDirectory'
                    ]
                }, (filePaths) => {
                    if (filePaths) {
                        fs.writeFile(filePaths, JSON.stringify(sth), 'utf8', (err) => {
                            if (err) {
                                alert(err)
                            }
                        })
                    }
                })
            },
            ...mapActions([
                'getStudents',
                'uploadRegisteredStudents'
            ]),
            ...mapMutations([
                'SET_REGISTERED_STUDENTS'
            ]),
            displayName (student) {
                return student ? student.firstName + ' ' + student.lastName + ' (' + student.preferredName + ')' : ''
            }
        },
        directives: {
            focus: {
                inserted (el) {
                    el.focus()
                }
            }
        },
        created () {
            const self = this
            this.smart = new SmartCardController()
            this.errorCallbackUnsubscriber = this.smart.onError((error) => {
                console.log(error)
            })
            this.connectCallbackUnsubscriber = this.smart.onConnect((reader) => {
                console.log(self.currentEvent)
                reader.onInsert((card) => {
                    self.rfid = card.atr
                    if (self.wait) {
                        self.sendRegister()
                        self.wait = false
                    }
                })
                reader.onEmpty((card) => {
                    self.rfid = ''
                    if (self.wait) {
                        self.wait = false
                    }
                })
                reader.onError((error) => {
                    console.log(error)
                })
            })
        },
        beforeDestroy () {
            if (this.smart) {
                this.smart.close()
            }
            if (this.errorCallbackUnsubscriber) {
                this.errorCallbackUnsubscriber()
            }
            if (this.connectCallbackUnsubscriber) {
                this.connectCallbackUnsubscriber()
            }
        },
        watch: {
            barcode (newValue) {
                if (typeof newValue === 'string') {
                    this.barcode = newValue.replace(/\D/g, '')
                }
            },
            authenticated (val) {
                if (!val) {
                    this.$router.push({name: 'login'})
                }
            }
        }
    }
</script>
<style scoped>
    .container-fluid {
        overflow-y: hidden;
    }
    .align-vertical {
        padding: 15% 0;
    }
    .btn {
        margin-bottom: 12px;
    }
    .col-xs-4 {
        padding: 0;
        height: 30%;
    }
    .list-group {
        overflow-y: scroll;
    }
    .list-group-height {
        height: calc(96vh - 300px);
    }
    .panel {
        height: 234px;
    }
    .list-group-item {
        font-size: 14pt;
    }
    li {
        height: 60px;
        line-height: 40px;
    }
    .detail {
        font-size: 14pt;
    }
</style>