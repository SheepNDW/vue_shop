<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 頭像區域 -->
      <div class="avatar-box">
        <img src="../assets/logo.png" alt="" />
      </div>
      <!-- 登入表單 -->
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginFormRules"
        label-width="0px"
        class="login-form"
      >
        <!-- 帳號 Account -->
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            prefix-icon="iconfont icon-user"
          ></el-input>
        </el-form-item>
        <!-- 密碼 Password -->
        <el-form-item prop="password">
          <el-input
            type="password"
            v-model="loginForm.password"
            prefix-icon="iconfont icon-3702mima"
          ></el-input>
        </el-form-item>
        <!-- Button -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登入</el-button>
          <el-button type="info" @click="resetLoginForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      // 登入表單數據
      loginForm: {
        username: "admin",
        password: "123456",
      },
      // 表單驗證規則
      loginFormRules: {
        // 驗證帳號
        username: [
          { required: true, message: "請輸入帳號", trigger: "blur" },
          {
            min: 3,
            max: 10,
            message: "長度在 3 到 10 個字符",
            trigger: "blur",
          },
        ],
        // 驗證密碼
        password: [
          { required: true, message: "請輸入密碼", trigger: "blur" },
          {
            min: 6,
            max: 15,
            message: "長度在 6 到 15 個字符",
            trigger: "blur",
          },
        ],
      },
    };
  },
  methods: {
    // 點擊重置button, 表單重置
    resetLoginForm() {
      this.$refs.loginFormRef.resetFields();
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        if (!valid) return;
        const { data: res } = await this.$http.post("login", this.loginForm);
        if (res.meta.status !== 200)
          return this.$message.error({ message: "登入失敗!", showClose: true });
        this.$message.success({ message: "登入成功!", showClose: true });
        // 1. 將登入成功之後的 token, 保存到客戶端的 sessionStorage中
        //   1.1 項目中除了登入之外的API接口, 必須在登入之後才能訪問
        //   1.2 token 只應在當前網站打開期間生效, 所以將 token 保存在 sessionStorage中
        window.sessionStorage.setItem("token", res.data.token);
        // 2. 通過編程式路由導航跳轉到後台主頁, 路由地址是 /home
        this.$router.push("/home");
      });
    },
  },
};
</script>

<style lang="scss" scoped>
.login-container {
  height: 100%;
  background-color: #2b4b6b;
}

.login-box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);

  .avatar-box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}

.login-form {
  width: 100%;
  position: absolute;
  bottom: 0;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  display: flex;
  justify-content: flex-end;
}
</style>
