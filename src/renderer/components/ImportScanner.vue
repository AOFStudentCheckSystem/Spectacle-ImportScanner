<template>
    <div class='container-fluid'>
        <div class="align-vertical col-xs-3">
            <div class='row'>
                <div class='col-xs-12'>
                    <h4>...'s card registered successfully!</h4>
                </div>
            </div>
            <br>
            <div class='row'>
                <div class='col-xs-12'>
                    <button @click="exportCards" class='btn btn-block btn-primary' :disabled="!cards.length">
                        {{cards.length?'Export cards registered in this session':'No cards registered in this session'}}
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
                                   placeholder='' required v-focus>
                        </div><!-- Username Field-->
                        <br>
                        <div class='input-group'>
                            <label class='input-group-addon' for='rfid'>Card RFID</label>
                            <input type='text' id='rfid' class='form-control' v-model='rfid' disabled
                                   placeholder='' required>
                        </div><!-- rfid Field-->
                        <div class='row'>
                            <div class='col-xs-12'>
                                <h5>Scan card and focus on barcode then press enter to register.</h5>
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
                    <button class="btn btn-default" type="button"><i class="fa fa-refresh"></i></button>
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
                    <p v-if="selectedIndex === -1">いいえ</p>
                    <div class="detail" v-else>
                        <p>{{magicStudent.firstName}} {{magicStudent.lastName}} ({{magicStudent.preferredName}})</p>
                        <p>Barcode:{{magicStudent.idNumber}}</p>
                        <button class='btn btn-block btn-primary' @click="barcode = magicStudent.idNumber">
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

    export default {
        name: 'import-scanner',
        data () {
            return {
                barcode: '',
                rfid: '',
                smart: null,
                errorCallbackUnsubscriber: null,
                connectCallbackUnsubscriber: null,
                cards: [],
                search: '',
                selectedIndex: -1,
                maxDisplay: 25,
                students: [
                    {
                        lastName: '1da',
                        firstName: 'lao',
                        preferredName: 'julao',
                        idNumber: '123'
                    },
                    {
                        lastName: '2da',
                        firstName: 'lao',
                        preferredName: 'julao',
                        idNumber: '124'
                    },
                    {
                        lastName: '3da',
                        firstName: 'lao',
                        preferredName: 'julao',
                        idNumber: '125'
                    },
                    {
                        lastName: '4da',
                        firstName: 'lao',
                        preferredName: 'julao',
                        idNumber: '126'
                    }
                ]
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
            }
        },
        methods: {
            register () {
                if (this.rfid === '') {
                    console.log('Wait')
                } else {
                    console.log('注册')
                }
            },
            selectStudent (index) {
                this.selectedIndex = index
            },
            exportCards () {

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