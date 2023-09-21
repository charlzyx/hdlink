import fs, { lstat } from "fs";
import path from "path";
import { db } from "./db";

type Link = {
  parent: string;
  value: string;
  dir: boolean;
  link: string;
};

const tree = (root: string, parent: string, list: Link[] = []) => {
  if (!fs.existsSync(parent)) return [];
  const subs = fs.readdirSync(parent);
  subs.forEach((sub) => {
    const abs = path.join(parent, sub);
    const isDir = fs.statSync(abs).isDirectory();
    if (fs.existsSync(abs) && isDir) {
      tree(root, abs, list);
    }

    list.push({
      link: "",
      parent: parent.replace(root, ""),
      value: abs.replace(root, ""),
      dir: isDir,
    });
  });
  return list;
};

const getConf = () => {
  const conftable = db
    .query<{ srcroot: string; destroot: string }, any>("SELECT * from conf")
    .all();
  console.log("conftable", conftable);
  return conftable[0];
};

const list = async (req: Request) => {
  const table = /src/.test(req.url) ? "src" : "dest";
  const list = db.query(`SELECT * from ${table}`).all();
  return Response.json({ code: 200, message: "OK", list });
};

const sync = async (table: "src" | "dest", list: Link[]) => {
  if (list.length == 0) return;
  db.run(`UPDATE ${table} SET missing = 1;`);
  const sql = `
    INSERT OR REPLACE INTO ${table} (parent, value, dir, link, missing)
    VALUES
    ${list
      .map((item) => {
        return `(${[item.parent, item.value, item.dir ? 1 : 0, item.link, 0]
          .map((i) => (typeof i === "number" ? i : `'${i}'`))
          .join(",")})`;
      })
      .join(",\n")}
  `;
  console.log("sync sql----\n", sql);
  db.run(sql);
};

const flush = async (table: "src" | "dest") => {
  db.run(` DELETE FROM ${table} WHERE missing = 1;`);
};

const fssync = async (req: Request) => {
  const conf = getConf();
  await sync("src", tree(conf.srcroot, conf.srcroot));
  await sync("dest", tree(conf.destroot, conf.destroot));
  await flush("src");
  await flush("dest");
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
];
