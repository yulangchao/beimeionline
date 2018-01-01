<template>
    <div>
        <!-- 全局header -->
        <nv-head :page-type="getTitleStr(searchKey.tab)"
                ref="head"
                :fix-head="true"
                :need-add="true">
        </nv-head>

        <section id="page">
            <!-- 首页列表 -->
            <ul class="posts-list">
                <li v-for="item in topics" :key="item._id">
                    <router-link :to="{name:'topic',params:{id:item._id}}">
                    <h3 v-text="item.title"
                            :class="getTabInfo(item.tab, item.good, item.top, true)"
                            :title="getTabInfo(item.tab, item.good, item.top, false)">
                    </h3>
                    <div class="content">
                        <img class="avatar" :src="item.author.avatar_url" />
                        <div class="info">
                            <p>
                                <span class="name">
                                    {{item.author.loginname}}
                                </span>
                                <span class="status">
                                    <b>{{item.replies.length}}</b>
                                    /{{item.visit_count}}
                                </span>
                            </p>
                            <p>
                                <time></time>
                                <time>{{item.created_at | getLastTimeStr(true)}}</time>
                            </p>
                        </div>
                    </div>
                    </router-link>
                </li>
            </ul>
        </section>
        <nv-top></nv-top>
    </div>
</template>

<script>
    import $ from 'webpack-zepto';
    import utils from '../libs/utils.js';
    import nvHead from '../components/header.vue';
    import nvTop from '../components/backtotop.vue';

    export default {
        filters: {
            getLastTimeStr(time, isFromNow) {
                return utils.getLastTimeStr(time, isFromNow);
            }
        },
        data() {
            return {
                currentLocation : { lat : 0, lng : 0},
                scroll: true,
                topics: [],
                index: {},
                searchKey: {
                    page: 1,
                    limit: 20,
                    tab: 'all',
                    mdrender: true,
                    city: 'Vancouver'
                },
                searchDataStr: ''
            };
        },
        mounted() {
            this.geolocation();
            if (this.$route.query && this.$route.query.tab) {
                this.searchKey.tab = this.$route.query.tab;
            }

            // 如果从详情返回并且之前存有对应的查询条件和参数
            // 则直接渲染之前的数据
            if (window.window.sessionStorage.searchKey && window.window.sessionStorage.tab === this.searchKey.tab) {
                this.topics = JSON.parse(window.window.sessionStorage.topics);
                this.searchKey = JSON.parse(window.window.sessionStorage.searchKey);
                this.$nextTick(() => $(window).scrollTop(window.window.sessionStorage.scrollTop));
            } else {
                this.getTopics();
            }
            // 滚动加载
            $(window).on('scroll', utils.throttle(this.getScrollData, 300, 1000));
        },
        beforeRouteLeave(to, from, next) {
            // 如果跳转到详情页面，则记录关键数据
            // 方便从详情页面返回到该页面的时候继续加载之前位置的数据
            if (to.name === 'topic') {
                // 当前滚动条位置
                window.window.sessionStorage.scrollTop = $(window).scrollTop();
                // 当前页面主题数据
                window.window.sessionStorage.topics = JSON.stringify(this.topics);
                // 查询参数
                window.window.sessionStorage.searchKey = JSON.stringify(this.searchKey);
                // 当前tab
                window.window.sessionStorage.tab = from.query.tab || 'all';
            }
            $(window).off('scroll');
            next();
        },
        beforeRouteEnter(to, from, next) {
            if (from.name !== 'topic') {
                // 页面切换移除之前记录的数据集
                if (window.window.sessionStorage.tab) {
                    window.window.sessionStorage.removeItem('topics');
                    window.window.sessionStorage.removeItem('searchKey');
                    window.window.sessionStorage.removeItem('tab');
                }
            }
            next();
        },
        methods: {
            geolocation() {
            navigator.geolocation.getCurrentPosition((position) => {
                this.currentLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                if(1){
                    this.searchKey.city = "Richmond";
                }
            }); 
            },
            // 获取title文字
            getTitleStr(tab) {
                let str = '';
                switch (tab) {
                    case 'share':
                        str = '分享';
                        break;
                    case 'ask':
                        str = '问答';
                        break;
                    case 'job':
                        str = '招聘';
                        break;
                    case 'good':
                        str = '认证';
                        break;
                    default:
                        str = '全部';
                        break;
                }
                return str;
            },
            // 获取不同tab的样式或者标题
            getTabInfo(tab, good, top, isClass) {
                return utils.getTabInfo(tab, good, top, isClass);
            },
            // 获取主题数据
            getTopics() {
                let params = $.param(this.searchKey);
                $.get('http://localhost:3002/api/topics?' + params, (d) => {
                    this.scroll = true;
                    if (d) {
                        d.forEach(this.mergeTopics);
                    }
                });
            },
            mergeTopics(topic) {
                if (typeof this.index[topic._id] === 'number') {
                    const topicsIndex = this.index[topic._id];
                    this.topics[topicsIndex] = topic;
                } else {
                    this.index[topic._id] = this.topics.length;
                    this.topics.push(topic);
                }
            },
            // 滚动加载数据
            getScrollData() {
                if (this.scroll) {
                    let totalheight = parseInt($(window).height(), 20) + parseInt($(window).scrollTop(), 20);
                    if ($(document).height() <= $(window).scrollTop() + 1000) {
                        // console.log($(document).height());
                        // console.log(totalheight);
                        // console.log($(window).scrollTop());
                        this.scroll = false;
                        this.searchKey.page += 1;
                        this.getTopics();
                    }
                }
            }
        },
        watch: {
            // 切换页面
            '$route' (to, from) {
                // 如果是当前页面切换分类的情况
                if (to.query && to.query.tab) {
                    this.searchKey.tab = to.query.tab;
                    this.topics = [];
                    this.index = {};
                }
                this.searchKey.page = 1;
                this.getTopics();
                // 隐藏导航栏
                this.$refs.head.show = false;
            }
        },
        components: {
            nvHead,
            nvTop
        }
    };
</script>
