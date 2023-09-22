<template>
  <n-collapse arrow-placement="right">
    <n-collapse-item :title="title">
      <div>
        <n-space>
          <n-input-group class="winput">
            <n-input-group-label size="small">解析正则:</n-input-group-label>
            <n-input size="small" v-model:value="inputRegex" />
          </n-input-group>
          <n-input-group class="winput">
            <n-input-group-label size="small">输出正则:</n-input-group-label>
            <n-input size="small" v-model:value="outputRegex" />
          </n-input-group>

          <n-button
            size="small"
            :type="unsaved ? 'primary' : 'default'"
            @click="save"
            >保存</n-button
          >
          <n-button size="small" @click="previewRenamedFiles">预览</n-button>
        </n-space>

        <br />
        <div v-if="renamedFiles.length > 0">
          <n-table size="small">
            <thead>
              <tr>
                <th width="50%">原始文件名</th>
                <th width="50%">新文件名</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(file, index) in renamedFiles" :key="index">
                <td>{{ file.oldName }}</td>
                <td>{{ dest }}/{{ file.newName }}</td>
              </tr>
            </tbody>
          </n-table>
        </div>
      </div>
      <br />
    </n-collapse-item>
  </n-collapse>
</template>

<script setup lang="ts">
import { watch, ref, defineProps, onMounted } from "vue";

const props = defineProps<{
  title: string;
  src: string;
  dest: string;
  list: string[];
}>();

const unsaved = ref(true);

const queryRule = () => {
  fetch("/api/rule/query", {
    method: "post",
    body: JSON.stringify({ src: props.src, dest: props.dest }),
  })
    .then((resp) => resp.json())
    .then((re) => {
      if (!re.data) return;
      unsaved.value = false;
      inputRegex.value = re.data.input;
      outputRegex.value = re.data.output;
    });
};
onMounted(() => {
  queryRule();
});

watch(
  () => {
    return { dest: props.dest, src: props.src };
  },
  () => {
    queryRule();
  }
);

const inputRegex = ref(".*(S\\d{1,2}).*(E\\d{1,2}).*(\\.\\w+)$"); // 解析正则
const outputRegex = ref("$1.$2$3"); // 输出正则
const fileList = props.list;
//  [
//   "长风渡.Destined.S01E01.2023.2160p.WEB-DL.H265.DDP5.1-SeeWEB.mp4",
//   "长风渡.Destined.S01E02.2023.2160p.WEB-DL.H265.DDP5.1-SeeWEB.mp4",
//   /* 你的文件列表 */
// ];
const renamedFiles = ref(
  fileList.map((item) => {
    return { oldName: item, newName: "" };
  })
); // 预览结果

const previewRenamedFiles = () => {
  // console.log("aaa");
  if (!inputRegex.value || !outputRegex.value) {
    return;
  }
  try {
    new RegExp(inputRegex.value, "g");
    new RegExp(outputRegex.value, "g");
  } catch (error) {
    return;
  }
  const regexInput = new RegExp(inputRegex.value, "g");
  const files = fileList.map((file) => {
    const newName = file.replace(regexInput, outputRegex.value);
    return { oldName: file, newName: newName };
  });
  renamedFiles.value = files;
};

watch(
  () => inputRegex.value + outputRegex.value,
  () => previewRenamedFiles(),
  { immediate: true }
);

const save = () => {
  // console.log("props", props);
  fetch("/api/rule", {
    method: "post",
    body: JSON.stringify({
      src: props.src,
      dest: props.dest,
      input: inputRegex.value,
      output: outputRegex.value,
    }),
  }).then(() => {
    // success
    unsaved.value = false;
  });
};
</script>

<style scoped>
/* 样式可以根据需要自行添加 */
</style>
