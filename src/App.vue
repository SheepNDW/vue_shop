<template>
  <div id="app">
    <!-- 路由 -->
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: "app",
};
</script>

<style lang="scss">
@font-face {
  font-family: "jf open huninn";
  src: url("./assets/fonts-family/jf-openhuninn-1.1.ttf");
}

* {
  font-family: "jf open huninn";
}
</style>
