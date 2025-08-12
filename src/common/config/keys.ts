import fs from 'fs';
import path from 'path';

const fp = path.join(process.cwd(), 'src', 'common', 'config');
const pvtKey = fs.readFileSync(path.join(fp, 'private.key'), 'utf8');
const pblKey = fs.readFileSync(path.join(fp, 'public.key'), 'utf8');

export { pvtKey, pblKey };
