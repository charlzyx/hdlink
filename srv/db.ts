import { Database } from "bun:sqlite";
import path from "path";

export const db = new Database(path.resolve(process.cwd(), "hdlink.sqlite"), {
  create: true,
});

export const init = () => {
  db.run(
    `
  CREATE TABLE IF NOT EXISTS src (
    value TEXT PRIMARY KEY,  -- 文件/目录路径
    dir BOOLEAN,  -- 是否是目录
    parent TEXT  -- 父级目录
  );`
  );

  db.run(
    `
  CREATE TABLE IF NOT EXISTS dest (
    value TEXT PRIMARY KEY,  -- '文件/目录路径'
    dir BOOLEAN,  -- 是否是目录
    parent TEXT  -- 父级目录
  );`
  );

  db.run(
    `
  CREATE TABLE IF NOT EXISTS conf (
    srcroot TEXT,  -- 源目录根
    destroot TEXT,  -- 目标目录根
    PRIMARY KEY (srcroot, destroot)
  );`
  );

  db.run(
    `
  CREATE TABLE IF NOT EXISTS dlink (
    src TEXT,  -- 源路径
    dest TEXT,  -- 目标路径
    PRIMARY KEY (src, dest)
  );`
  );

  db.run(
    `
  CREATE TABLE IF NOT EXISTS rule (
    src TEXT,
    dest TEXT,
    input TEXT,  -- 输入正则
    output TEXT,  -- 输出正则
    PRIMARY KEY (src, dest)
  );`
  );
};
