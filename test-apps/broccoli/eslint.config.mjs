import { ember } from 'ember-eslint';
import * as url from 'url';

// Needed until Node 20
const dirname = url.fileURLToPath(new URL('.', import.meta.url));

export default [...ember.recommended(dirname)];
