<template>
    <div>
        <nv-head page-type="主题"
                :show-menu="showMenu"
                :need-add="true"
                :fix-head="true">
        </nv-head>

        <div id="page"
                :class="{'show-menu':showMenu}"
                v-if="topic.title">

            <h2 class="topic-title" v-text="topic.title"></h2>
            <section class="author-info">
                <img class="avatar" :src="topic.author.avatar_url" />
                <div class="col">
                    <span>{{topic.author.loginname}}</span>
                    <time>
                        发布于:{{topic.created_at | getLastTimeStr(true)}}
                    </time>
                </div>
                <div class="right">
                    <span class="tag"
                            :class="getTabInfo(topic.tab, topic.good, topic.top, true)"
                            v-text="getTabInfo(topic.tab, topic.good, topic.top, false)">
                    </span>
                    <span class="name">{{topic.visit_count}}次浏览</span>
                </div>
            </section>
            <carousel-3d v-if="topic.imgs.length" :controls-visible="true" :clickable="false">
                                    <slide v-for="img, key in topic.imgs" :index="key">
                                        <img style="width:360px;height:270px;" class="" :src="img" />
                                    </slide>


            </carousel-3d>

            <section class='markdown-body topic-content' v-html="topic.content">

            </section>

            <h3 class="topic-reply">
                <strong>{{topic.reply_count}}</strong> 回复
            </h3>

            <section class="reply-list">
                <ul>
                    <li v-for="item in topic.replies">
                        <section class="user">
                            <router-link :to="{name:'user',params:{loginname:item.author.loginname}}" >
                                <img class="head" :src="item.author.avatar_url"/>
                            </router-link>
                            <div class="info">
                                <span class="cl">
                                    <span class="name" v-text="item.author.loginname"></span>
                                    <span class="name mt10">
                                        <span></span>
                                        发布于:{{item.create_at | getLastTimeStr(true)}}</span>
                                </span>
                                <span class="cr">
                                    <span class="iconfont icon"
                                        :class="{'uped':isUps(item.ups)}"
                                        @click="upReply(item)">&#xe608;</span>
                                    {{item.ups.length}}
                                    <span class="iconfont icon" @click="addReply(item._id)">&#xe609;</span>
                                </span>
                            </div>
                        </section>
                        <div class="reply_content" v-html="item.content"></div>
                        <nv-reply :topic.sync="topic"
                                :topic-id="topicId"
                                :reply-id="item._id"
                                :reply-to="item.author.loginname"
                                :show.sync="curReplyId"
                                @close="hideItemReply"
                                v-if="userInfo.userId && curReplyId === item._id"></nv-reply>
                    </li>
                </ul>
            </section>
            <nv-top></nv-top>
            <nv-reply v-if="userInfo.userId"
                    :topic="topic"
                    :topic-id="topicId">
            </nv-reply>
        </div>

        <div class='no-data' v-if="noData">
            <i class="iconfont icon-empty">&#xe60a;</i>
            该话题不存在!
        </div>
    </div>
</template>
<script>
import $ from "webpack-zepto";
import utils from "../libs/utils.js";
import nvHead from "../components/header.vue";
import nvReply from "../components/reply.vue";
import nvTop from "../components/backtotop.vue";
import { mapGetters } from "vuex";

export default {
  data() {
    return {
      showMenu: false, // 是否展开左侧菜单
      topic: {}, // 主题
      noData: false,
      topicId: "",
      curReplyId: ""
    };
  },
  computed: {
    ...mapGetters({
      userInfo: "getUserInfo"
    })
  },
  mounted() {
    // 隐藏左侧展开菜单
    this.showMenu = false;

    // 获取url传的tab参数
    this.topicId = this.$route.params.id;

    // 加载主题数据
    $.get("/api/topics/" + this.topicId, d => {
      if (d) {
        this.topic = d;
        $.get("/api/replies/" + this.topicId, d => {
          if (d) {
            this.topic.replies = d;
          }
        });
      } else {
        this.noData = true;
      }
    });
  },
  methods: {
    getTabInfo(tab, good = false, top, isClass) {
      return utils.getTabInfo(tab, good, top, isClass);
    },
    getLastTimeStr(time, ago) {
      return utils.getLastTimeStr(time, ago);
    },
    isUps(ups) {
      return $.inArray(this.userInfo.userId, ups) >= 0;
    },
    addReply(id) {
      this.curReplyId = id;
      if (!this.userInfo.userId) {
        this.$router.push({
          name: "login",
          params: {
            redirect: encodeURIComponent(this.$route.path)
          }
        });
      }
    },
    hideItemReply() {
      this.curReplyId = "";
    },
    upReply(item) {
      if (!this.userInfo.userId) {
        this.$router.push({
          name: "login",
          params: {
            redirect: encodeURIComponent(this.$route.path)
          }
        });
      } else {
        if ($.inArray(this.userInfo.userId, item.ups) < 0) {
          $.ajax({
            type: "POST",
            url: "/api/reply/ups",
            data: {
              accesstoken: this.userInfo.token,
              id: item._id
            },
            dataType: "json",
            success: res => {
              if (res) {
                item.ups.push(this.userInfo.userId);
              }
            },
            error: res => {
              let error = JSON.parse(res.responseText);
              this.$alert(error.error_msg);
              return false;
            }
          });
        }
      }
    }
  },
  components: {
    nvHead,
    nvReply,
    nvTop
  }
};
</script>
