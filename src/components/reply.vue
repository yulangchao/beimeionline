<template>

    <section class="reply">
        <textarea id="content" rows="8" class="text"
            :class="{'err':hasErr}"
            v-model="content"
            placeholder='回复支持Markdown语法,请注意标记代码'>
        </textarea>
        <a class="button" @click="addReply">确定</a>
    </section>

</template>
<script>
    import $ from 'webpack-zepto';
    const utils = require('../libs/utils');
    const markdown = require('markdown').markdown;
    import {
        mapGetters
    } from 'vuex';

    export default {
        replace: true,
        props: ['topic', 'replyId', 'topicId', 'replyTo', 'show'],
        data() {
            return {
                hasErr: false,
                content: ''
            };
        },
        computed: {
            ...mapGetters({
                userInfo: 'getUserInfo'
            })
        },
        mounted() {
            if (this.replyTo) {
                this.content = `@${this.replyTo} `;
            }
        },
        methods: {
            addReply() {
                if (!this.content) {
                    this.hasErr = true;
                } else {
                    let time = new Date();
                    let linkUsers = utils.linkUsers(this.content);
                    let htmlText = markdown.toHTML(linkUsers);
                    let replyContent = $('<div class="markdown-text"></div>').append(htmlText)[0].outerHTML;
                    let postData = {
                        accesstoken: this.userInfo.token,
                        content: replyContent
                    };

                    if (this.replyId) {
                        postData.reply_id = this.replyId;
                    }

                    if (this.replyTo) {
                        postData.replyTo = this.replyTo;
                    }
                    postData.title=this.topic.title;
                    $.ajax({
                        type: 'POST',
                        url: `/api/topics/${this.topicId}/replies`,
                        data: postData,
                        dataType: 'json',
                        success: (res) => {
                            if (res) {
                                this.topic.replies.push({
                                    _id: res._id,
                                    author: {
                                        loginname: this.userInfo.loginname,
                                        avatar_url: this.userInfo.avatar_url
                                    },
                                    content: replyContent,
                                    ups: [],
                                    create_at: time
                                });
                            }
                            this.content = '';
                            if (this.show) {
                                this.$emit('close');
                            }
                        },
                        error: (res) => {
                            var error = JSON.parse(res.responseText);
                            this.$alert(error.error_msg);
                            return false;
                        }
                    });
                }
            }
        }
    };
</script>
