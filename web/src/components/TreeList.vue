<template>
  <div>
    <node
      v-for="(node, i) in root"
      :key="node.value"
      :node="node"
      :deepth="0"
      :parents="[]"
      :pos="[i]"
      @update="onNodeUpdate"
    ></node>
  </div>
</template>

<script setup lang="ts">
import { computed, h, onMounted, watch, ref } from "vue";
import { Link, buildTree } from "../shared";
import Node from "../components/Node.vue";

const src = ref<SLink[]>([]);

const dest = ref<SLink[]>([]);

onMounted(() => {
  fetch("/api/tree/src", { method: "POST" })
    .then((resp) => resp.json())
    .then((re) => (src.value = re.list));
  fetch("/api/tree/dest", { method: "POST" })
    .then((resp) => resp.json())
    .then((re) => (dest.value = re.list));
});

type SLink = Omit<Link, "link"> & { link: string };

type NodeLike = {
  children?: NodeLike[];
};

const each = <T extends NodeLike>(list: T[], cb: (item: T) => void) => {
  list.forEach((item) => {
    cb(item);
    if (item.children) {
      each(item.children as T[], cb);
    }
  });
};

const merge = (s: SLink[], d: SLink[]) => {
  const stree = buildTree(s);
  const dtree = buildTree(s);
  const root = stree.root;
  each(root, (ln) => {
    (ln as Link).link = dtree.map[(ln as SLink).link!];
  });
  return root as Link[];
};

const root = ref<Link[]>([]);

watch(
  () => merge(src.value, dest.value),
  (merged) => (root.value = merged)
);

const onNodeUpdate = (pos: number[], neo: Link) => {
  console.log("ON UPDATE");
  pos.reduce((target, pidx, idx) => {
    const isLast = idx === pos.length - 1;
    if (isLast) {
      target[pidx] = neo;
      return target;
    } else {
      return target[pidx].children!;
    }
  }, root.value);
  root.value = root.value;
};
</script>
