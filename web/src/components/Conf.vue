<template>
  <n-space justify="end">
    <n-input-group class="winput">
      <n-input-group-label>源目录根</n-input-group-label>
      <n-input v-model:value="data.srcroot" placeholder="源目录根"></n-input>
    </n-input-group>
    <n-input-group class="winput">
      <n-input-group-label>目标目录根</n-input-group-label>
      <n-input v-model:value="data.destroot" placeholder="目标目录根"></n-input>
    </n-input-group>
    <n-button @click="save">保存</n-button>
    <n-button @click="sync"> 同步</n-button>
  </n-space>
</template>
<script setup>
import { useMessage } from "naive-ui";
import { ref, onMounted } from "vue";
const data = ref({ srcroot: "", destroot: "" });

const message = useMessage();

onMounted(() => {
  fetch("/api/conf", { method: "get" })
    .then((r) => r.json())
    .then((resp) => {
      // console.log("resp", resp);
      data.value = resp.data || {};
      // console.log("data.value", JSON.stringify(data.value, null, 2));
    });
});

const save = () => {
  // console.log("data.value", data.value);
  fetch("/api/conf", { method: "post", body: JSON.stringify(data.value) }).then(
    () => {
      message.success("保存成功");
    }
  );
};

const sync = () => {
  fetch("/api/fs/sync").then(() => {
    message.success("同步成功");
  });
};
</script>

<style>
.winput {
  width: 400px;
}
</style>
