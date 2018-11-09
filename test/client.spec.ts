import "@babel/polyfill";

import { promisify } from 'util';
import * as assert from 'assert';
import * as noflo from 'noflo';
// import * as zmq from 'zeromq';

import { HedgehogClient } from "hedgehog-client";

// needs to be imported here, otherwise Mocha will complain about a leaked variable
import '../lib/ConnectionStore';

const loadFBP = promisify(noflo.graph.loadFBP);

async function load(source: string) {
    return promisify(noflo.asCallback(await loadFBP(source)));
}

describe('FBP', () => {
    it('should work', async () => {
        const echo = await load(`\
INPORT=Copy.IN:INPUT
OUTPORT=Copy.OUT:OUTPUT

Copy(core/Copy)
`);

        assert.strictEqual(await echo('foo'), 'foo');
    });
});

// TODO mock the server, requires exposed RequestMsg and ReplyMsg in hedgehog-client
describe('Client:', () => {
    let endpoint = null;

    before(() => {
        endpoint = 'tcp://localhost:10789';
    });

    it('should work with implicit endpoint', async () => {
        const testcase = await load(`\
INPORT=Connect.IN:IN
OUTPORT=Analog.OUT:OUT

Connect(hedgehog-client/Connect)
Analog(hedgehog-client/ReadAnalog)
Disconnect(hedgehog-client/Disconnect)

0 -> port Analog
Connect out -> in Analog out -> in Disconnect
`);

        // pass a bang as the single network input
        assert.deepStrictEqual(await testcase(true), 0);
    });

    it('should work with endpoint connections', async () => {
        const testcase = await load(`\
INPORT=Connect.IN:IN
INPORT=Connect.ENDPOINT:ENDPOINT
OUTPORT=Analog.OUT:OUT

Connect(hedgehog-client/Connect)
Analog(hedgehog-client/ReadAnalog)
Disconnect(hedgehog-client/Disconnect)

# route endpoint through the graph
Connect endpoint -> endpoint Analog endpoint -> endpoint Disconnect

0 -> port Analog
Connect out -> in Analog out -> in Disconnect
`);

        // don't pass an endpoint: Connect uses the default, others get it handed explicitly
        assert.deepStrictEqual(await testcase([
            { in: true },
        ]), [{
            out: 0
        }]);

        // pass the default endpoint explicitly
        assert.deepStrictEqual(await testcase([
            { endpoint },
            { in: true },
        ]), [{
            out: 0
        }]);

        // pass a custom endpoint explicitly, to check the endpoint is propagated properly
        assert.deepStrictEqual(await testcase([
            { endpoint: 'tcp://localhost:11789' },
            { in: true },
        ]), [{
            out: 0
        }]);
    });

    it('should work with streams', async () => {
        const testcase = await load(`\
INPORT=Connect.IN:IN
OUTPORT=Analog.OUT:OUT

Connect(hedgehog-client/Connect)
Delay1(core/RepeatDelayed)
Analog(hedgehog-client/ReadAnalogStream)
Delay2(core/RepeatDelayed)
Disconnect(hedgehog-client/Disconnect)

0 -> port Analog
Connect out -> start Analog

# enough time for three updates
160 -> delay Delay1
Connect out -> in Delay1 out -> stop Analog

# enough time to check no more updates are emitted
60 -> delay Delay2
Delay1 out -> in Delay2 out -> in Disconnect
`);

        // pass a bang as the single network input
        assert.deepStrictEqual(await testcase([
            { in: true },
        ]), [
            { out: 0 },
            { out: 0 },
            { out: 0 },
        ]);
    });

    after(() => {
        endpoint = null;
    });
});
