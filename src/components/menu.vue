<template>
    <section id="sideBar" class="nav-list" :class="{'show':showMenu}">
        <user-info></user-info>
        <section class="list-ul">
            <router-link class="icon-quanbu iconfont item" :to="{'name':'list',query:{tab:'all'}}">全部</router-link>
            <router-link class="icon-hao iconfont item" :to="{'name':'list',query:{tab:'good'}}">认证</router-link>
            <router-link class="icon-fenxiang iconfont item" :to="{'name':'list',query:{tab:'game'}}">游戏</router-link>
            <router-link class="icon-wenda iconfont item" :to="{'name':'list',query:{tab:'house'}}">房屋</router-link>
            <router-link class="icon-zhaopin iconfont item" :to="{'name':'list',query:{tab:'job'}}">工作</router-link>
            <router-link class="icon-xiaoxi iconfont item line" :to="{'name':'message'}">消息</router-link>
            <router-link class="icon-about iconfont item" :to="{'name':'about'}">关于</router-link>
            <a class="icon-about iconfont item" v-if="userInfo.loginname" @click="logout">登出</a>
        </section>
    </section>
</template>
<script>
    import {
        mapGetters
    } from 'vuex';
    export default {
        replace: true,
        computed: {
            ...mapGetters({
                userInfo: 'getUserInfo'
            })
        },
        props: ['showMenu', 'pageType', 'nickName', 'profileUrl'],
        components: {
            'userInfo': require('./user-info.vue')
        },
        methods:{
            logout(){
                window.window.sessionStorage.clear();
                this.$store.dispatch('setUserInfo', {loginname: null});
                this.$router.push('login');
            }
        }
    };
</script>

<style lang="scss">
    /*侧边栏*/
    
    .nav-list {
        position: fixed;
        top: 0;
        bottom: 0;
        left: -200px;
        width: 200px;
        background-color: #fff;
        color: #313131;
        transition: all .3s ease;
        z-index: 99;
        &.show {
            transform: translateX(200px);
        }
    }
    /*侧边栏列表*/
    
    .list-ul {
        margin: 0 24px;
        border-top: 1px solid #d4d4d4;
        overflow: hidden;
        padding-top: 9%;
        .item {
            display: block;
            font-size: 14px;
            font-weight: 200;
            padding: 9% 0;
            text-align: left;
            text-indent: 1px;
            line-height: 15px;
            color: #313131;
            font-weight: 700;
            &:last-child {
                margin-bottom: 50px;
            }
            &:before {
                color: #2c3e50;
            }
        }
        .line {
            border-top: 1px solid #d4d4d4;
        }
    }
</style>