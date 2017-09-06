<template>
    <div class='container vert-parent login-parent'>
        <div class='align-vertical'>
            <div class='panel' id='loginPanel'>
                <div class='panel-heading'>
                    <h3 align='center'>Almost There</h3>
                </div>
                <div class='panel-body'>
                    <form @submit.prevent='exportCards'>
                        <div class='input-group'>
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
                                <h5>Once a barcode is entered and a card is scanned, this card will be registered.</h5>
                            </div>
                        </div>
                        <br>
                        <div class='row'>
                            <div class='col-xs-12'>
                                <h3>...'s card registered successfully!</h3>
                            </div>
                        </div>
                        <br>
                        <div class='row'>
                            <div class='col-xs-12'>
                                <button type='submit' class='btn btn-block btn-primary' :disabled="cards.length === 0">
                                    Export cards registered in this session
                                </button>
                            </div>
                        </div>
                    </form>
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
                cards: []
            }
        },
        methods: {
            exportCards () {

            }
        },
        directives: {
            focus: {
                componentUpdated (el) {
                    el.focus()
                }
            }
        },
        created () {
            this.smart = new SmartCardController()
            this.errorCallbackUnsubscriber = this.smart.onError((error) => {
                console.log(error)
            })
            this.connectCallbackUnsubscriber = this.smart.onConnect((reader) => {
                console.log(self.currentEvent)
                reader.onInsert((card) => {
                    console.log('addRecord', card.atr)
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
    .vert-parent {
        padding: 5% 0;
    }
    .login-parent {
        max-width: 600px;
    }
    .align-vertical {
        padding: 10% 0;
    }
    .footer {
        bottom: 0;
        width: 100%;
        /* Set the fixed height of the footer here */
        height: 40px;
        background-color: #f0f0f0;
    }
    .footer-text-right {
        margin-right: 20px;
    }
    .first {
        margin-top: 50px;
    }
    .btn {
        margin-bottom: 12px;
    }
    .input-group {
        /*margin-bottom: 1em;*/
    }
</style>