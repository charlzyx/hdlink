export type Link = {
  value: string;
  parent: string;
  dir: boolean;
  link?: Link;
  children?: Link[];
};

export const buildTree = (list: Omit<Link, "link">[]) => {
  // 先排序， 这样就可以根据 reduce 顺序处理三级目录
  // 1. 根目录在最前 M1,M2
  // 2. 二级目录紧随其后 M1/S01, M1/S02
  // 3. 三级目录就按照2处理, 文件就不递归了
  const clone = JSON.parse(JSON.stringify(list)) as typeof list;

  clone.sort((a, b) => {
    const alen = a.value.split("/").length;
    const blen = b.value.split("/").length;
    return alen === blen ? (a.value as any) - (b.value as any) : alen - blen;
  });

  const tree = clone.reduce(
    (t, node) => {
      if (node.parent === "") {
        const fine = {
          ...node,
          children: [],
        };
        t.root.push(fine);
        // ref
        t.map[node.value] = fine;
      } else {
        const parent = t.map[node.parent];
        const fine = { ...node };
        if (fine.dir) {
          fine.children = [];
        }
        parent.children.push(fine);
        // ref
        t.map[node.value] = fine;
      }

      return t;
    },
    { map: {}, root: [] as Omit<Link, "link">[] }
  );

  return tree;
};
