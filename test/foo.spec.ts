import "@babel/polyfill";

import { promisify } from 'util';
import * as assert from 'assert';
import * as noflo from 'noflo';

const loadFBP = promisify(noflo.graph.loadFBP);

describe('FBP', () => {

    async function load(source: string) {
        return promisify(noflo.asCallback(await loadFBP(source)));
    }

    it('should work', async () => {
        const echo = await load(`\
INPORT=Copy.IN:INPUT
OUTPORT=Copy.OUT:OUTPUT

Copy(core/Copy)
`);

        assert.strictEqual(await echo('foo'), 'foo');
    });
});
