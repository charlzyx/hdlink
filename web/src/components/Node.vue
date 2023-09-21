<template>
  <div class="llnode">
    <n-space>
      <div class="flex1">{{ node.value }}</div>
      <span v-if="node.dir">==></span>
      <span v-if="!node.dir">~></span>
      <div class="flex1">
        <n-input
          :disabled="!parentslink && deepth! > 0"
          placeholder="请输入文件夹名称"
          v-if="node.dir"
          size="small"
          v-model:value="link.value"
        >
          <template #prefix> {{ parentslink }}/ </template>
        </n-input>
        <div v-if="!node.dir" class="ltext">
          {{ parentslink }}/{{ link.value }}
        </div>
      </div>
      <n-button v-if="node.dir" size="small" @click="nodeupdate">保存</n-button>
    </n-space>
    <node
      v-for="(n, i) in node.children"
      :key="node.value"
      :node="n"
      :parents="[...props.parents, node]"
      :deepth="(deepth || 0) + 1"
      :pos="[...props.pos, i]"
      @update="onNodeUpdate"
    ></node>
  </div>
</template>
<script setup lang="ts">
import { computed, ref, defineProps } from "vue";
import { Link } from "../shared";
import Node from "./Node.vue";

const props = defineProps<{
  pos: number[];
  node: Link;
  parents?: Link[];
  deepth?: number;
}>();

const emit = defineEmits<{
  (event: "update", pos: number[], node: Link): void;
}>();

const link = ref({ ...props.node.link });

const parentslink = computed(() => {
  return props.parents
    ?.map((item) => item.link?.value)
    .filter(Boolean)
    .join("/");
});

const nodeupdate = () => {
  const node = props.node;
  const plink = parentslink.value?.split("/");
  const neo = {
    ...node,
    link: {
      ...node.link,
      value: link.value.value || "",
      children: node.children ? [] : undefined,
      dir: node.children ? true : false,
      parent: plink ? plink[plink.length - 1] : "",
      link: node.value as any,
    },
  };
  console.log("emit update", props.pos, neo);
  emit("update", props.pos, neo);
};

const onNodeUpdate = (ppos: number[], nneo: Link) => {
  console.log("deep emit update", ppos, nneo);
  emit("update", ppos, nneo);
};
</script>

<style>
.llnode {
  padding: 0.2rem;
}
.llnode > .llnode {
  width: 100%;
  padding-left: 1rem;
}
.flex1 {
  flex: 1;
}
.ltext {
  display: inline-flex;
  width: 100%;
}
</style>
