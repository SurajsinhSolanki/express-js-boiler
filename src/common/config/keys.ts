import fs from "node:fs";
import path from "node:path";

const fp = path.join(process.cwd(), "public", "keys");
const pvtKey = fs.readFileSync(path.join(fp, "private.key"), "utf8");
const pblKey = fs.readFileSync(path.join(fp, "public.key"), "utf8");

export { pvtKey, pblKey };
