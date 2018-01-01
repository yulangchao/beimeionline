<template>
    <div class="login-page">
        <nv-head page-type="登录">
        </nv-head>
        <section class="page-body">
            <div class="label">
                <input class="txt" type="text" placeholder="Access Token" v-model="email" maxlength="36">
            </div>
            <div class="label">
                <input class="txt" type="text" placeholder="Access Token" v-model="password" maxlength="36">
            </div>
            <div class="label">
                <a class="button" @click="logon">登录</a>
            </div>
        </section>
    </div>
</template>

<script>
    import $ from 'webpack-zepto';
    import nvHead from '../components/header.vue';
    import jwt from 'jsonwebtoken';

    export default {
        data() {
            return {
                token: '',
                password: '',
                email: ''
            };
        },
        methods: {
            logon() {
                $.ajax({
                    type: 'POST',
                    url: 'http://localhost:3002/auth/sign_in',
                    data: {
                        email: this.email,
                        password: this.password
                    },
                    dataType: 'json',
                    success: (res) => {
                        
                        this.token = res.token;
                        var res = jwt.decode(res.token);
                        console.log(res);
                        let user = {
                            loginname: res.fullName,
                            avatar_url: res.avatar_url,
                            userId: res._id,
                            token: this.token,
                            email: res.email
                        };
                        window.window.sessionStorage.user = JSON.stringify(user);
                        this.$store.dispatch('setUserInfo', user);
                        let redirect = decodeURIComponent(this.$route.query.redirect || '/');
                        this.$router.push({
                            path: redirect
                        });
                    },
                    error: (res) => {
                        var error = JSON.parse(res.responseText);
                        console.log(error);
                        this.$alert(error.message);
                    }
                });
            }
        },
        components: {
            nvHead
        }
    };
</script>
<style lang="scss">
    .page-body {
        padding: 50px 15px;
        min-height: 400px;
        background-color: #fff;
        .label {
            display: inline-block;
            width: 100%;
            margin-top: 15px;
            position: relative;
            left: 0;
            top: 0;
            .txt {
                padding: 12px 0;
                border: none;
                border-bottom: 1px solid #4fc08d;
                background-color: transparent;
                width: 100%;
                font-size: 14px;
                color: #313131;
            }
            .button {
                display: inline-block;
                width: 99%;
                height: 42px;
                line-height: 42px;
                border-radius: 3px;
                color: #fff;
                font-size: 16px;
                background-color: #4fc08d;
                border: none;
                border-bottom: 2px solid #3aa373;
                text-align: center;
                vertical-align: middle;
            }
            .file {
                position: absolute;
                top: 0;
                left: 0;
                height: 42px;
                width: 48%;
                outline: medium none;
                opacity: 0;
            }
        }
    }
</style>
