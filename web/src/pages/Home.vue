<template>
  <div>
    <h2>HDLink 硬链接</h2>
    <n-space justify="end">
      <template #header-extra> 基础配置 </template>
      <conf @sync="onConfChange"></conf>
    </n-space>
  </div>
  <n-divider />
  <tree-list :srcroot="conf.srcroot" :destroot="conf.destroot"></tree-list>
</template>
<script setup>
import { onMounted, ref } from "vue";
import Conf from "../components/Conf.vue";
import TreeList from "../components/TreeList.vue";
const conf = ref({ srcroot: "", destroot: "" });
const onConfChange = (data) => (conf.value = data);

onMounted(() => {});
</script>
