<template>
  <el-button type="info" @click="logOut">退出</el-button>
</template>

<script>
export default {
  name: "Home",
  methods: {
    logOut() {
      // 清空token
      window.sessionStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
};
</script>

<style lang="scss" scoped></style>
