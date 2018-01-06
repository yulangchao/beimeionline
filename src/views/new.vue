<template>
    <div>
        <nv-head page-type="主题"
            :show-menu="false"
            :fix-head="true"></nv-head>
        <div class="add-container">
            <div class="line">选择分类：
                <select class="add-tab" v-model="topic.tab">
                    <option value="game">游戏</option>
                    <option value="house">房屋</option>
                    <option value="job">工作</option>
                </select>
                <a class="add-btn" @click="addTopic">发布</a>
            </div>

            <div class="line">
                <input class="add-title" v-model="topic.title"
                        type="text" :class="{'err':err=='title'}"
                        placeholder="标题，字数10字以上" max-length="100"/>
            </div>
            <div class="line">选择城市：
                <select class="add-tab" v-model="topic.city">
                    <option value="Vancouver">温哥华</option>
                    <option value="Richmond">列治文</option>
                    <option value="Burnaby">本拿比</option>
                </select>
            </div>
            <textarea v-model="topic.content" rows="10" class="add-content"
                :class="{'err':err=='content'}"
                placeholder='回复支持Markdown语法,请注意标记代码'>
            </textarea>
            <div class="vue-uploader">
                <div class="file-list">
                    <section v-for="(file, index) of files" class="file-item draggable-item">
                        <img :src="file.src" alt="" ondragstart="return false;">
                        <p class="file-name">{{file.name}}</p>
                        <span class="file-remove" @click="remove(index)">+</span>
                    </section>
                    <section v-if="status == 'ready'" class="file-item">
                        <div @click="add" class="add">
                            <span>+</span>
                        </div>
                    </section>
                </div>
                <div v-if="loading" class="load-bg">
                      <circle4></circle4>
                </div>
                <input type="file" accept="image/*" @change="fileChanged" ref="file" multiple="multiple">
            </div>
        </div>
    </div>
</template>

<script>
import $ from "webpack-zepto";
import nvHead from "../components/header.vue";
import { mapGetters } from "vuex";
import { Circle4 } from "vue-loading-spinner";

export default {
  data() {
    return {
      topic: {
        tab: "game",
        title: "11111111111111111",
        content: "11111111111111111",
        city: "Vancouver"
      },
      err: "",
      status: "ready",
      files: [],
      point: {},
      uploading: false,
      percent: 0,
      mobile: window.innerWidth <= 992,
      loading: false
    };
  },
  mounted() {
    window.addEventListener("resize", function(event) {
      this.mobile = window.innerWidth <= 992;
    });
  },
  computed: {
    ...mapGetters({
      userInfo: "getUserInfo"
    })
  },
  methods: {
    add() {
      if (this.mobile) {
        this.$refs.file.click();
        this.$refs.file.click();
      } else {
        this.$refs.file.click();
      }
    },
    submit() {
      if (this.files.length === 0) {
        console.warn("no file!");
        return;
      }
      const formData = new FormData();
      this.files.forEach(item => {
        formData.append(item.name, item.file);
      });
    },
    finished() {
      this.files = [];
      this.status = "ready";
    },
    remove(index) {
      this.files.splice(index, 1);
    },
    fileChanged() {
      const list = this.$refs.file.files;
      for (let i = 0; i < list.length; i++) {
        if (!this.isContain(list[i])) {
          const item = {
            name: list[i].name,
            size: list[i].size,
            file: list[i]
          };
          this.html5Reader(list[i], item);
          this.files.push(item);
        }
      }
      this.$refs.file.value = "";
    },
    // 将图片文件转成BASE64格式
    html5Reader(file, item) {
      const reader = new FileReader();
      reader.onload = e => {
        this.$set(item, "src", e.target.result);
      };
      reader.readAsDataURL(file);
    },
    isContain(file) {
      this.files.forEach(item => {
        if (item.name === file.name && item.size === file.size) {
          return true;
        }
      });
      return false;
    },
    uploadProgress(evt) {
      const component = this;
      if (evt.lengthComputable) {
        const percentComplete = Math.round(evt.loaded * 100 / evt.total);
        component.percent = percentComplete / 100;
      } else {
        console.warn("upload progress unable to compute");
      }
    },
    addTopic() {
      const formData = new FormData();
      this.files.forEach((item, key) => {
        formData.append(key, item.file);
      });
      let title = $.trim(this.topic.title);
      let contents = $.trim(this.topic.content);

      if (!title || title.length < 10) {
        this.err = "title";
        return false;
      }
      if (!contents) {
        this.err = "content";
        return false;
      }
      this.loading = true;
      let postData = {
        ...this.topic,
        content: this.topic.content,
        accesstoken: this.userInfo.token,
        hasImage: this.files.length > 0
      };

      $.ajax({
        type: "POST",
        url: "/api/topics",
        data: postData,
        dataType: "json",
        success: res => {
          if (res.hasImage) {
            this.$alert("uploading images");
            formData.append("id", res._id);
            $.ajax({
              type: "POST",
              url: "/api/topics/upload",
              data: formData,
              processData: false,
              contentType: false,
              success: res => {
                if (res) {
                  this.loading = false;
                  this.$alert("uploaded");
                  this.$router.push({
                    name: "list"
                  });
                }
              },
              error: res => {
                this.loading = false;
                this.$alert(res);
                return false;
              }
            });
          } else {
            this.loading = false;
            this.$router.push({
              name: "list"
            });
          }
        },
        error: res => {
          this.loading = false;
          let error = JSON.parse(res.responseText);
          this.$alert(error.error_msg);
          return false;
        }
      });
    }
  },
  components: {
    nvHead,
    Circle4
  }
};
</script>

<style lang="scss">
.load-bg {
  position: fixed;
  height: 100vh;
  width: 100vw;
  background-color: rgba(1, 0, 0, 0.3);
  top: 44px !important;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}
.spinner--circle-4 {
  width: 80px !important;
  height: 80px !important;
  position: fixed !important;
  top: 40%;
  right: 0;
  left: 0;
  margin: auto;
}
.add-container {
  margin-top: 50px;
  background-color: #fff;
  .line {
    padding: 10px 15px;
    border-bottom: solid 1px #d4d4d4;
    .add-btn {
      color: #fff;
      background-color: #80bd01;
      padding: 5px 15px;
      border-radius: 5px;
    }
    .add-tab {
      height: 27px;
      display: inline-block;
      width: calc(100% - 140px);
      min-width: 50%;
      font-size: 16px;
      background: transparent;
      :after {
        content: "xe60e";
      }
    }
    .add-title {
      font-size: 16px;
      border: none;
      width: 100%;
      background: transparent;
      height: 25px;
    }
    .err {
      border: solid 1px red;
    }
  }
  .add-content {
    margin: 15px 2%;
    width: 96%;
    border-color: #d4d4d4;
    color: #000;
  }
  .err {
    border: solid 1px red;
  }
}
.vue-uploader {
  border: 1px solid #e5e5e5;
}
.vue-uploader .file-list {
  padding: 10px 0px;
}
.vue-uploader .file-list:after {
  content: "";
  display: block;
  clear: both;
  visibility: hidden;
  line-height: 0;
  height: 0;
  font-size: 0;
}
.vue-uploader .file-list .file-item {
  float: left;
  position: relative;
  width: 100px;
  text-align: center;
}
.vue-uploader .file-list .file-item img {
  width: 80px;
  height: 80px;
  border: 1px solid #ececec;
}
.vue-uploader .file-list .file-item .file-remove {
  position: absolute;
  right: 12px;
  display: none;
  top: 4px;
  width: 14px;
  height: 14px;
  color: white;
  cursor: pointer;
  line-height: 12px;
  border-radius: 100%;
  transform: rotate(45deg);
  background: rgba(0, 0, 0, 0.5);
}
.vue-uploader .file-list .file-item:hover .file-remove {
  display: inline;
}
.vue-uploader .file-list .file-item .file-name {
  margin: 0;
  height: 40px;
  word-break: break-all;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.vue-uploader .add {
  width: 80px;
  height: 80px;
  margin-left: 10px;
  float: left;
  text-align: center;
  line-height: 80px;
  border: 1px dashed #ececec;
  font-size: 30px;
  cursor: pointer;
}
.vue-uploader .upload-func {
  display: flex;
  padding: 10px;
  margin: 0px;
  background: #f8f8f8;
  border-top: 1px solid #ececec;
}
.vue-uploader .upload-func .progress-bar {
  flex-grow: 1;
}
.vue-uploader .upload-func .progress-bar section {
  margin-top: 5px;
  background: #00b4aa;
  border-radius: 3px;
  text-align: center;
  color: #fff;
  font-size: 12px;
  transition: all 0.5s ease;
}
.vue-uploader .upload-func .operation-box {
  flex-grow: 0;
  padding-left: 10px;
}
.vue-uploader .upload-func .operation-box button {
  padding: 4px 12px;
  color: #fff;
  background: #007acc;
  border: none;
  border-radius: 2px;
  cursor: pointer;
}
.vue-uploader > input[type="file"] {
  display: none;
}
</style>