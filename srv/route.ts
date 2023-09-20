import { db } from "./db";
import fs from "fs";
import path from "path";

const loop = (
  root: string,
  parent: string,
  list: {
    type: "src" | "dest";
    parent: string;
    value: string;
    dir: boolean;
  }[] = []
) => {
  console.log("--dir--", parent);

  const subs = fs.readdirSync(parent);

  subs.forEach((sub) => {
    const abs = path.join(parent, sub);
    const isDir = fs.statSync(abs).isDirectory();

    if (fs.existsSync(abs) && isDir) {
      loop(root, abs, list);
    }
    list.push({
      parent: parent.replace(root, ""),
      value: abs.replace(root, ""),
      type: "src",
      dir: isDir,
    });
  });
  return list;
};

export const sync = async (req: Request) => {
  const q = await req.json();
  const list = loop(q.root, q.root);
  return Response.json({ list });
};

export const matcher = [
  {
    path: "/sync",
    handler: sync,
  },
];
