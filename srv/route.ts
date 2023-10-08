import fs from "fs";
import path from "path";
import { globSync } from "glob";
import { db } from "./db";

type Link = {
  parent: string;
  value: string;
  dir: boolean;
};

const ll = (dir: string) => {
  const simple = (x: string) =>
    (x ? x + "/" : x).replace(/\/+/g, "/").replace(/\/$/, "");
  const cmd = `${dir}/**/*.{txt,mp4}`;
  const output = globSync(cmd);
  // 先排序， 这样就可以根据 reduce 顺序处理三级目录
  // 1. 根目录在最前 M1,M2
  // 2. 二级目录紧随其后 M1/S01, M1/S02
  // 3. 三级目录就按照2处理, 文件就不递归了

  output.sort((a, b) => {
    return a.length - b.length;
  });

  const getParent = (x: string) => {
    const segs = x.split("/") || "";
    segs.pop();
    return simple(segs.join("/"));
  };
  const fill = (x: string) => {
    const suffix = x.replace(dir, "");
    const segs = suffix.split("/");
    return [...segs].reduceRight((mm, _, i) => {
      const v = simple([dir + "/", ...segs].join("/"));
      segs.pop();
      const p = simple([dir + "/", ...segs].join("/"));
      if (v === dir) return mm;
      mm[v] = {
        value: v,
        parent: p,
        dir: true,
      };
      return mm;
    }, {} as Record<string, Link>);
  };

  let parents = {};
  let tree = output.reduce((m, i) => {
    const p = getParent(i);
    if (m[p]) {
      m[p].children = m[p].children || [];
      m[p].children?.push({
        value: i,
        parent: p,
        dir: false,
      });
    } else {
      m[p] = {
        value: simple(p),
        parent: getParent(p),
        dir: true,
        children: [
          {
            value: i,
            parent: simple(p),
            dir: false,
          },
        ],
      };
    }
    parents = {
      ...parents,
      ...fill(p),
    };
    return m;
  }, {} as Record<string, Link & { children?: Link[] }>);

  return { ...parents, ...tree };
};

const lltree = (tree: Record<string, Link & { children?: Link[] }>) => {
  const list: Link[] = [];
  Object.keys(tree).forEach((dir) => {
    list.push(tree[dir]);
    if (tree[dir].children) {
      list.push(...tree[dir].children!);
    }
  });
  return list;
};

const tree = (root: string, parent: string, list: Link[] = []) => {
  if (!fs.existsSync(parent)) return [];
  const subs = fs.readdirSync(parent);
  // 合并单个文件夹
  if (subs.length == 1) {
    const parent = list[list.length - 1];
    list[list.length - 1] = {
      ...parent,
      value: parent.value + subs[0],
    };
    return list;
  }
  subs.forEach((sub) => {
    const abs = path.join(parent, sub);
    const isExist = fs.existsSync(abs);
    const isDir = isExist || fs.statSync(abs).isDirectory();
    list.push({
      parent: parent.replace(root, ""),
      value: abs.replace(root, ""),
      dir: isDir,
    });
    if (isExist && isDir) {
      tree(root, abs, list);
    }
  });
  return list;
};

const getConf = () => {
  const conftable = db
    .query<{ srcroot: string; destroot: string }, any>("SELECT * from conf")
    .all();
  return conftable[0];
};

const list = async (req: Request) => {
  const table = /src/.test(req.url) ? "src" : "dest";
  const list = db.query(`SELECT * from ${table}`).all();
  return Response.json({ code: 200, message: "OK", list });
};

const sync = async (table: "src" | "dest", list: Link[]) => {
  if (list.length == 0) return;
  db.run(` DELETE FROM ${table}`);

  const sql = `
    INSERT INTO ${table} (parent, value, dir)
    VALUES
    ${list
      .map((item) => {
        return `(${[item.parent, item.value, item.dir ? 1 : 0]
          .map((i) => (typeof i === "number" ? i : `'${i}'`))
          .join(",")})`;
      })
      .join(",\n")}
  `;
  db.run(sql);
};

const flush = async () => {
  const src = db.query<{ value: string }, any>(`SELECT value from src`).all();
  const dest = db.query<{ value: string }, any>(`SELECT value from dest`).all();
  const dlink = db
    .query<{ src: string; dest: string }, any>(`SELECT * from dlink`)
    .all();
  const smap = src.reduce((m: Record<string, boolean>, s) => {
    m[s.value] = true;
    return m;
  }, {});
  const dmap = dest.reduce((m: Record<string, boolean>, d) => {
    m[d.value] = true;
    return m;
  }, {});
  const missing = dlink.filter((x) => {
    return !smap[x.src] || !dmap[x.dest];
  });
  if (missing.length > 0) {
    const sqllist = missing
      .map((item) => {
        return `(src = '${item.src}' AND dest = '${item.dest}')`;
      })
      .join(" OR \n");
    // console.log("missing", missing, smap, dmap);
    db.run(`DELETE FROM dlink WHERE ${sqllist};`);
    db.run(`DELETE FROM rule WHERE ${sqllist};`);
  }
};

const fssync = async (req: Request) => {
  const conf = getConf();
  await sync("src", lltree(ll(conf.srcroot)));
  await sync("dest", lltree(ll(conf.destroot)));
  await flush();
  return Response.json({ code: 200, message: "OK" });
};

const conf = async (req: Request) => {
  if (/get/i.test(req.method)) {
    const data = getConf();
    return Response.json({ code: 200, message: "OK", data });
  } else {
    const r = await req.json<{ srcroot: string; destroot: string }>();
    db.run(`DELETE FROM conf;`);
    const sql = `
    INSERT INTO conf (srcroot, destroot) VALUES ('${r.srcroot}', '${r.destroot}');`;

    db.run(sql);
    const now = db.query("SELECT * from conf").all();
    return Response.json({ code: 200, message: "OK", data: now });
  }
};

const dlink = async (req: Request) => {
  if (/get/i.test(req.method)) {
    const list = db.query(`SELECT * from dlink`).all();
    return Response.json({ code: 200, message: "OK", list });
  } else {
    const pair = await req.json<{ src: string; dest: string }>();
    db.run(`
    INSERT OR REPLACE INTO dlink (src, dest) VALUES ('${pair.src}', '${pair.dest}')
    `);
    return Response.json({ code: 200, message: "OK" });
  }
};

const uplink = async (req: Request) => {
  const info = await req.json<{ src: string; dest: Link }>();
  db.run(`
  INSERT OR REPLACE INTO dlink (src, dest) VALUES ('${info.src}', '${info.dest.value}')
  `);
  db.run(`
  INSERT OR REPLACE INTO dest (parent, value, dir)
  VALUES
  (
    '${info.dest.parent}',
    '${info.dest.value}',
    '${info.dest.dir ? 1 : 0}'
    );`);

  return Response.json({ code: 200, message: "OK" });
};

const rule = async (req: Request) => {
  if (/query/i.test(req.url)) {
    const ruleset = await req.json<{
      src: string;
      dest: string;
    }>();
    const list = db
      .query(
        `SELECT * from rule WHERE (src = '${ruleset.src}' AND dest = '${ruleset.dest}')`
      )
      .all();

    return Response.json({ code: 200, message: "OK", data: list[0] });
  } else {
    const ruleset = await req.json<{
      src: string;
      dest: string;
      input: string;
      output: string;
    }>();
    db.run(`
    INSERT OR REPLACE INTO rule (src, dest, input, output) VALUES ('${
      ruleset.src
    }', '${ruleset.dest}', '${ruleset.input || ""}', '${ruleset.output || ""}')
    `);
    return Response.json({ code: 200, message: "OK" });
  }
};

export const matcher = [
  {
    path: "/conf",
    handler: conf,
  },
  {
    path: "/fs/sync",
    handler: fssync,
  },
  {
    path: "/tree/src",
    handler: list,
  },
  {
    path: "/tree/dest",
    handler: list,
  },
  {
    path: "/dlink",
    handler: dlink,
  },
  {
    path: "/uplink",
    handler: uplink,
  },
  {
    path: "/rule/query",
    handler: rule,
  },
  {
    path: "/rule",
    handler: rule,
  },
];
