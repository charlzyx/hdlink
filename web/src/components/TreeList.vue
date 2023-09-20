<template>
  <n-data-table
    :columns="columns"
    :data="data"
    :row-key="rowKey"
    default-expand-all
  />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import type { DataTableColumns } from "naive-ui";

type Link = {
  id: number;
  parent: string;
  value: string;
  type: "src" | "dest";
  dir: boolean;
  link: string;
};

const buildTree = (list: Link[]) => {
  // 先排序， 这样就可以根据 reduce 顺序处理三级目录
  // 1. 根目录在最前 M1,M2
  // 2. 二级目录紧随其后 M1/S01, M1/S02
  // 3. 三级就是文件了
  list.sort((a, b) => a.parent && b.parent ?  a.value.split('/').length - b.value.split('/').length : 1)

  const mapping = list.reduce((m, node, index) => {
    m[node.value] = { node, index };
    return m
  }, {})
  const tree = list.reduce((t, node) => {
    if (node.parent === '') {
    } else {
    }

    return t;

  }, [])

}
type RowData = {
  from: string;
  to: string;
  children?: RowData[];
};
export default defineComponent({
  setup() {
    const data: RowData[] = [
      {
        from: "07akioni",
        to: "07",
        children: [
          {
            from: "08akioni",
            to: "08",
            children: [
              {
                from: "09akioni",
                to: "09",
              },
              {
                from: "10akioni",
                to: "10",
              },
            ],
          },
        ],
      },
      {
        from: "11akioni",
        to: "11",
      },
    ];
    const columns: DataTableColumns<RowData> = [
      {
        title: "from",
        key: "from",
      },
      {
        title: "to",
        key: "to",
      },
    ];
    return {
      rowKey: (row: RowData) => row.to,
      columns,
      data,
    };
  },
});
</script>
