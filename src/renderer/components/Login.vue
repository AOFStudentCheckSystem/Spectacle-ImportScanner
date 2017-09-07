<template>
    <div class='container vert-parent login-parent'>
        <div class='align-vertical'>
            <div class='panel' id='loginPanel'>
                <div class='panel-heading'>
                    <h3 align='center'>AOFCheck Client Mk3 "Spectacle" Import Scanner</h3>
                </div>
                <div class='panel-body'>
                    <form @submit.prevent='login'>
                        <div class='input-group'>
                            <label class='input-group-addon' for='username'>username</label>
                            <input type='text' id='username' class='form-control' v-model='username'
                                   placeholder='' required>
                        </div><!-- Username Field-->
                        <br>
                        <div class='input-group'>
                            <label class='input-group-addon' for='password'>password</label>
                            <input type='password' id='password' class='form-control' v-model='password'
                                   placeholder='' required>
                        </div><!-- password Field-->
                        <br>
                        <div class='row'>
                            <div class='col-xs-12'>
                                <button type='submit' class='btn btn-block btn-primary' :disabled='signingIn'>
                                    {{ signingIn ? 'Logging in...' : 'Log in' }}
                                </button>
                            </div>
                        </div>
                        <div class="row err" v-if="err">
                            {{err}}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import {mapActions, mapGetters} from 'vuex'
    export default {
        name: 'login',
        data () {
            return {
                username: '',
                password: '',
                err: ''
            }
        },
        computed: mapGetters([
            'signingIn',
            'authenticated'
        ]),
        methods: {
            async login () {
                try {
                    await this.authenticate(this.username, this.password)
                    if (this.authenticated) {
                        this.err = 'An error occurred'
                    } else {
                        this.$router.push({name: 'import-scanner'})
                    }
                } catch (error) {
                    console.error('login@Login.vue', error)
                }
            },
            ...mapActions([
                'authenticate'
            ])
        }
    }
</script>
<style scoped>
    .vert-parent {
        padding: 5% 0;
    }
    .login-parent {
        max-width: 320px;
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
    .err {
        color: red;
    }
</style>