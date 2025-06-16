<script setup lang="ts">
import { microApp } from 'micro-app'
import { onMounted } from 'vue';
onMounted(() => {
  // 初始化 micro-app
  console.log('microApp', microApp);
  microApp.start();
})

</script>

<template>
  <h1>测试微前端</h1>
  <micro-app
    name="react_app1"
    url="http://localhost:5174"
  ></micro-app>
</template>

<style scoped>
</style>
