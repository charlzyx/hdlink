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
  type: "src" | "dest";
  dir: boolean;
  link: number;
  parent: string;
  value: string;
};
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
