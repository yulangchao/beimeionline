<template>
    <div class="login-page">
        <nv-head page-type="注册">
        </nv-head>
        <section class="page-body">
            <div class="label">
                <input class="form-control" type="text" placeholder="Name" v-model="name" maxlength="36" required>
            </div>
            <div class="label">
                <input class="form-control" type="email" placeholder="Email" v-model="email" maxlength="36" required>
            </div>
            <div class="label">
                <input class="form-control" type="password" placeholder="Passwrod" v-model="password" maxlength="36" required>
            </div>
            <div class="label">
                <input class="form-control" type="password" placeholder="Confirm Passwrod" v-model="confirmpassword" maxlength="36" required >
            </div>

            <div style="margin: 7.2px;" class="vue-uploader">
                <div class="file-list">
                    <section v-for="(file, index) of files" class="file-item draggable-item">
                        <img :src="file.src" alt="" ondragstart="return false;">
                        <p class="file-name">{{file.name}}</p>
                        <span class="file-remove" @click="remove(index)">+</span>
                    </section>
                    <section v-if="files.length==0" class="file-item">
                        <div @click="add" class="add">
                            <span>+</span>
                        </div>
                    </section>
                </div>
                <div v-if="loading" class="load-bg">
                      <circle4></circle4>
                </div>
                <input type="file" id="imgs" accept="image/*" @change="fileChanged" ref="file">
            </div>
            <div class="label">
                <a class="btn btn-primary btn-block" type="submit" @click="register">注册</a>
            </div>
        </section>
    </div>
</template>

<script>
import $ from "webpack-zepto";
import nvHead from "../components/header.vue";
import jwt from "jsonwebtoken";
import { Circle4 } from "vue-loading-spinner";

export default {
  data() {
    return {
      name: "",
      token: "",
      password: "",
      email: "",
      confirmpassword: "",
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
  methods: {
    add() {
      if (this.mobile) {
        $("#imgs").click();
        this.$refs.file.click();
      } else {
        $("#imgs").click();
      }
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
    ValidateEmail(email) {
      if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
        return true;
      }
      return false;
    },
    register() {
      if (!this.ValidateEmail(this.email)) {
        this.$alert("Enter the correct email");
        return;
      }
      if (this.password.length < 8) {
        this.$alert("Password should be grt than 7 digits");
        return;
      }
      if (this.password != this.confirmpassword) {
        this.$alert("Passwords are not matched");
        return;
      }
      this.loading = true;
      const formData = new FormData();
      this.files.forEach((item, key) => {
        formData.append(key, item.file);
      });
      $.ajax({
        type: "POST",
        url: "/auth/register",
        data: {
          email: this.email,
          password: this.password,
          fullName: this.name,
          hasImg: this.files.length > 0
        },
        dataType: "json",
        success: res => {
          if (res.avatar_url == null) {
            formData.append("id", res._id);
            $.ajax({
              type: "POST",
              url: "/auth/register/upload",
              data: formData,
              processData: false,
              contentType: false,
              success: res => {
                this.loading = false;
                this.$alert("Register done");
                this.$router.push("/login");
              },
              error: res => {
                this.loading = false;
                this.$alert("not done");
                var error = JSON.parse(res.responseText);
                console.log(typeof error.message.errmsg == "undefined");
                this.$alert((typeof error.message.errmsg != "undefined") ? error.message.errmsg : error.message,message);
              }
            });
          } else {
            this.loading = false;
            this.$alert("Register done");
            this.$router.push("/login");
          }
        },
        error: res => {
          this.loading = false;
          this.$alert("not done");
          var error = JSON.parse(res.responseText);
           console.log(error);
          console.log(typeof error.message.errmsg == "undefined");
          this.$alert((typeof error.message.errmsg != "undefined") ? error.message.errmsg : error.message.message);
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
