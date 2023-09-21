<template>
  <n-space>
    <n-tag>{{ src?.value }}</n-tag>
    <n-input v-model:value="value">
      <template #prefix>
        {{ me.parent || "" }}
      </template>
    </n-input>
    <n-button @click="save">保存</n-button>
  </n-space>
</template>

<script setup lang="ts">
import { defineProps, ref, computed, Ref } from "vue";
import { Link, buildTree } from "../shared";

const { src, dest } = defineProps<{
  src: Link;
  dest: Link[];
}>();

const tree = computed(() => buildTree(dest));

const me = computed(() => {
  return src.link
    ? tree.value.map[src.link]
    : { value: "", parent: "", dir: true, link: src.value };
});

const value = ref(me.value.value);
console.log("value.value", value.value.value);
const save = () => {
  console.log(me.value, value.value);
};
</script>
