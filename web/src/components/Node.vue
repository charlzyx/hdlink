<template>
  <div class="llnode">
    <n-space>
      <div class="flex1">{{ node.value }}</div>
      <span v-if="node.dir">==></span>
      <span v-if="!node.dir">~></span>
      <div class="flex1 nnode">
        <n-input-group v-if="node.dir">
          <n-input
            :disabled="!parentslink && deepth! > 0"
            placeholder="请输入文件夹名称"
            size="small"
            v-model:value="link.short"
          >
            <template #prefix>
              <span class="bold"> {{ parentslink }}/</span>
            </template>
          </n-input>
          <n-button v-if="node.dir" size="small" @click="nodeupdate"
            >保存</n-button
          >
        </n-input-group>
      </div>
      <div v-if="isLeaf" class="">
        <rename
          title="重命名"
          :src="node.value"
          :dest="link?.value || ''"
          :list="node.children?.map((item) => item.value) || []"
        ></rename>
      </div>
    </n-space>
    <node
      v-if="!isLeaf"
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
import { watch, computed, ref, defineProps } from "vue";
import { Edit20Regular } from "@vicons/fluent";
import { Link } from "../shared";
import Node from "./Node.vue";
import Rename from "../components/Rename.vue";

const props = defineProps<{
  pos: number[];
  node: Link;
  parents?: Link[];
  deepth?: number;
}>();

const emit = defineEmits<{
  (event: "update", pos: number[], node: Link): void;
}>();

const link = ref({ ...props.node.link, short: "" });

const parentslink = computed(() => {
  return props.parents
    ?.map((item) => item.link?.value)
    .filter(Boolean)
    .join("/");
});

watch(
  () => props.node.link,
  (ln) => {
    const neo = { ...link.value, ...ln };
    neo.short = neo.value?.replace?.(parentslink.value + "/" || "", "") || "";
    link.value = neo;
  }
);
const isLeaf = computed(() => {
  return Boolean(props.node.children?.find((x) => !x.children));
});

const nodeupdate = () => {
  const node = props.node;
  const neo = {
    ...node,
    link: {
      ...node.link,
      value: `${parentslink.value}/${link.value.short}`,
      children: node.children ? [] : undefined,
      dir: node.children ? true : false,
      parent: parentslink.value || "",
      link: node.value as any,
    },
  };
  // console.log("emit update", props.pos, neo);
  emit("update", props.pos, neo);
};

const onNodeUpdate = (ppos: number[], nneo: Link) => {
  // console.log("deep emit update", ppos, nneo);
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
.bold {
  font-weight: bold;
  color: rgba(0, 0, 0, 0.4);
}
.nnode .n-input .n-input__prefix {
  margin-right: 0;
}
</style>
