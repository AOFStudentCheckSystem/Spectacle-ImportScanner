<template>
    <div class='container-fluid'>
        <div class="align-vertical col-xs-3">
            <div class='row'>
                <div class='col-xs-12'>
                    <h4>Last registered: None</h4>
                </div>
            </div>
            <br>
            <div class='row'>
                <div class='col-xs-12'>
                    <button @click="exportCards" class='btn btn-block btn-primary' :disabled="!registeredStudents.length">
                        {{registeredStudents.length?'Export unuploaded registrations':'No unuploaded registrations'}}
                    </button>
                </div>
            </div>
        </div>
        <div class="align-vertical col-xs-5">
            <div class='panel' id='loginPanel'>
                <div class='panel-heading'>
                    <h3 align='center'>Almost There</h3>
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
                    {{student.firstName}} {{student.lastName}} ({{student.preferredName}})
                </li>
            </ul>
            <h3 class="list-group-height" v-else>Please type more letters</h3>
            <div class="panel panel-default">
                <div class="panel-body">
                    <div v-if="selectedIndex === -1">
                        <p>何でもない</p>
                        <p>什么都没有</p>
                        <p>Nothing here</p>
                    </div>
                    <div class="detail" v-else>
                        <p>{{magicStudent.firstName}} {{magicStudent.lastName}} ({{magicStudent.preferredName}})</p>
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
    import {mapGetters, mapActions} from 'vuex'
    import moment from 'moment'

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
                wait: false
            }
        },
        computed: {
            displaying () {
                this.selectedIndex = -1
                return this.students.filter((s) => {
                    let sr = this.search.toUpperCase()
                    return s.lastName.toUpperCase().indexOf(sr) >= 0 || s.firstName.indexOf(sr) >= 0 || s.preferredName.indexOf(sr) >= 0
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
                'lastUpdate'
            ]),
            lastUpdateTime () {
                return this.lastUpdate ? moment(this.lastUpdate).format('lll') : 'Never'
            }
        },
        methods: {
            async register () {
                if (this.rfid === '') {
                    console.log('Wait')
                    this.wait = true
                } else {
                    console.log('注册')
                    await this.sendRegister()
                }
            },
            async sendRegister () {
                console.log('啦', this.barcode, this.rfid)
                this.rfid = ''
                this.barcode = ''
            },
            selectStudent (index) {
                this.selectedIndex = index
            },
            exportCards () {

            },
            ...mapActions([
                'getStudents'
            ])
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
            barcode () {
                this.barcode = this.barcode.replace(/\D/g, '')
            },
            rfid () {
                this.rfid = this.rfid.toUpperCase()
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