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
import { computed, h, onMounted, defineProps, watch, ref } from "vue";
import { Link, buildTree } from "../shared";
import Node from "../components/Node.vue";

const src = ref<SLink[]>([]);
const dest = ref<SLink[]>([]);
const props = defineProps<{
  srcroot: string;
  destroot: string;
}>();
const dlink = ref<
  { src: string; dest: string; reg_src?: string; reg_dest?: string }[]
>([]);

onMounted(() => {
  fetch("/api/tree/src", { method: "POST" })
    .then((resp) => resp.json())
    .then((re) => (src.value = re.list));
  fetch("/api/tree/dest", { method: "POST" })
    .then((resp) => resp.json())
    .then((re) => (dest.value = re.list));
  fetch("/api/dlink")
    .then((resp) => resp.json())
    .then((re) => (dlink.value = re.list));
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
  const stree = buildTree(props.srcroot, s);
  const dtree = buildTree(props.destroot, d);
  const root = stree.root;
  const dmap = dlink.value.reduce((m, x) => {
    m[x.src] = x.dest;
    return m;
  }, {});
  // console.log({ dtree, dmap, dlink: dlink.value });
  each(root, (s) => {
    (s as Link).link = dtree.map[dmap[s.value]!];
  });
  return root as Link[];
};

const root = ref<Link[]>([]);

watch(
  () => merge(src.value, dest.value),
  (merged) => {
    root.value = merged;
    // console.log(merged);
  }
);

const onNodeUpdate = (pos: number[], neo: Link) => {
  pos.reduce((target, pidx, idx) => {
    const isLast = idx === pos.length - 1;
    if (isLast) {
      target[pidx] = neo;
      fetch("/api/uplink", {
        method: "POST",
        body: JSON.stringify({
          src: neo.value,
          dest: neo.link,
        }),
      });
      return target;
    } else {
      return target[pidx].children!;
    }
  }, root.value);
  root.value = root.value;
};
</script>
