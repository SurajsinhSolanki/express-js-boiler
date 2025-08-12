import fs from 'fs';

const pvtKey = fs.readFileSync('private.key', 'utf8');
const pblKey = fs.readFileSync('public.key', 'utf8');

export { pvtKey, pblKey };
