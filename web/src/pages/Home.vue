<template>
  <div>
    <h2>HDLink 硬链接</h2>
    <n-space justify="end">
      <template #header-extra> 基础配置 </template>
      <conf></conf>
    </n-space>
  </div>
  <n-divider />
  <tree-list></tree-list>
</template>
<script setup>
import { useMessage } from "naive-ui";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import Conf from "../components/Conf.vue";
import TreeList from "../components/TreeList.vue";

onMounted(() => {});
</script>
