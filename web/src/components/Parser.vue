<template>
  <n-tag
    :type="index % 2 !== 0 ? 'success' : ''"
    v-for="(item, index) in list"
    :key="index"
    >{{ item }}</n-tag
  >
</template>
<script setup lang="ts">
import { onMounted, computed, defineProps, ref, watch } from "vue";
const props = defineProps<{
  rule: string;
  text: string;
}>();
const list = ref<string[]>([]);
const map = ref<Record<string, boolean>>();

// console.log("-----", props);
const parse = (rule: string, text: string) => {
  let str = text;
  let reg = new RegExp(rule, "g");
  const ans = reg.exec(str) || [];
  const [origin, ...matchers] = ans;
  map.value = matchers.reduce((m, i) => {
    if (i) {
      m[i] = true;
    }
    return m;
  }, {});

  list.value = ans;
};

onMounted(() => {
  parse(props.rule, props.text);
});
watch(
  () => ({ rule: props.rule, text: props.text }),
  ({ rule, text }) => {
    parse(rule, text);
  }
);
</script>
