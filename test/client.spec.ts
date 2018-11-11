import "@babel/polyfill";

import { promisify } from 'util';
import * as assert from 'assert';
import * as noflo from 'noflo';
// tslint:disable-next-line:no-implicit-dependencies
import * as zmq from 'zeromq';

import { HedgehogClient, protocol, Message, ack, analog, digital, motor, servo } from "hedgehog-client";

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
describe('Client', () => {
    let server1 = null;
    let server2 = null;

    before(() => {
        server1 = zmq.socket('router');
        server1.bindSync('tcp://*:10789');
    });

    before(() => {
        server2 = zmq.socket('router');
        server2.bindSync('tcp://*:0');
    });

    async function mock_server(server, ...pairs: Array<[Message[], Message[]]>) {
        function recv() {
            return new Promise<Buffer[]>((resolve, reject) => {
                server.once('message', (...parts: Buffer[]) => {
                    setTimeout(() => {
                        resolve(parts);
                    }, 0);
                });
            });
        }

        for(let [expected, responses] of pairs) {
            let [ident, delimiter, ...data] = await recv();
            let requests = data.map(msg => protocol.RequestMsg.parse(msg));

            assert.deepStrictEqual(requests, expected);

            server.send([
                ident, delimiter,
                ...responses.map(msg => Buffer.from(protocol.ReplyMsg.serialize(msg)))
            ]);
        }
    }

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

        let promise: Promise<void>;
        promise = mock_server(server1,
            [[new analog.Request(0)], [new analog.Reply(0, 0)]],
        );

        // don't pass an endpoint: Connect uses the default, others get it handed explicitly
        assert.deepStrictEqual(await testcase([
            { in: true },
        ]), [{
            out: 0
        }]);

        await promise;

        promise = mock_server(server1,
            [[new analog.Request(0)], [new analog.Reply(0, 0)]],
        );

        // pass the default endpoint explicitly
        assert.deepStrictEqual(await testcase([
            { endpoint: server1.last_endpoint },
            { in: true },
        ]), [{
            out: 0
        }]);

        await promise;

        promise = mock_server(server2,
            [[new analog.Request(0)], [new analog.Reply(0, 0)]],
        );

        // pass a custom endpoint explicitly, to check the endpoint is propagated properly
        assert.deepStrictEqual(await testcase([
            { endpoint: server2.last_endpoint },
            { in: true },
        ]), [{
            out: 0
        }]);

        await promise;
    });

    describe('ReadAnalog', () => {
        it('should work', async () => {
            const testcase = await load(`\
INPORT=Connect.IN:IN
OUTPORT=Analog.OUT:OUT

Connect(hedgehog-client/Connect)
Analog(hedgehog-client/ReadAnalog)
Disconnect(hedgehog-client/Disconnect)

0 -> port Analog
Connect out -> in Analog out -> in Disconnect
`);

            mock_server(server1,
                [[new analog.Request(0)], [new analog.Reply(0, 0)]],
            );

            // pass a bang as the single network input
            assert.deepStrictEqual(await testcase(true), 0);
        });
    });

    describe('ReadAnalogStream', () => {
        it('should work', async () => {
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

            mock_server(server1,
                [[new analog.Request(0)], [new analog.Reply(0, 0)]],
                [[new analog.Request(0)], [new analog.Reply(0, 0)]],
                [[new analog.Request(0)], [new analog.Reply(0, 0)]],
            );

            // pass a bang as the single network input
            assert.deepStrictEqual(await testcase([
                { in: true },
            ]), [
                { out: 0 },
                { out: 0 },
                { out: 0 },
            ]);
        });
    });

    describe('ReadDigital', () => {
        it('should work', async () => {
            const testcase = await load(`\
INPORT=Connect.IN:IN
OUTPORT=Digital.OUT:OUT

Connect(hedgehog-client/Connect)
Digital(hedgehog-client/ReadDigital)
Disconnect(hedgehog-client/Disconnect)

0 -> port Digital
Connect out -> in Digital out -> in Disconnect
`);

            mock_server(server1,
                [[new digital.Request(0)], [new digital.Reply(0, false)]],
            );

            // pass a bang as the single network input
            assert.deepStrictEqual(await testcase(true), false);
        });
    });

    describe('ReadDigitalStream', () => {
        it('should work', async () => {
            const testcase = await load(`\
INPORT=Connect.IN:IN
OUTPORT=Digital.OUT:OUT

Connect(hedgehog-client/Connect)
Delay1(core/RepeatDelayed)
Digital(hedgehog-client/ReadDigitalStream)
Delay2(core/RepeatDelayed)
Disconnect(hedgehog-client/Disconnect)

0 -> port Digital
Connect out -> start Digital

# enough time for three updates
160 -> delay Delay1
Connect out -> in Delay1 out -> stop Digital

# enough time to check no more updates are emitted
60 -> delay Delay2
Delay1 out -> in Delay2 out -> in Disconnect
`);

            mock_server(server1,
                [[new digital.Request(0)], [new digital.Reply(0, false)]],
                [[new digital.Request(0)], [new digital.Reply(0, false)]],
                [[new digital.Request(0)], [new digital.Reply(0, false)]],
            );

            // pass a bang as the single network input
            assert.deepStrictEqual(await testcase([
                { in: true },
            ]), [
                { out: false },
                { out: false },
                { out: false },
            ]);
        });
    });

    describe('Motor', () => {
        it('should work', async () => {
            const testcase = await load(`\
INPORT=Connect.IN:IN
OUTPORT=Disconnect.OUT:OUT

Connect(hedgehog-client/Connect)
Power(core/SendNext)  # caches a constant power value until a bang is received
Motor(hedgehog-client/Motor)
Disconnect(hedgehog-client/Disconnect)

0 -> port Motor
1000 -> data Power
Connect out -> in Power out -> power Motor out -> in Disconnect
`);

            mock_server(server1,
                [[new motor.Action(0, motor.MotorState.POWER, 1000)], [new ack.Acknowledgement()]],
            );

            // pass a bang as the single network input
            assert.deepStrictEqual(await testcase(true), true);
        });
    });

    describe('Servo', () => {
        it('should work', async () => {
            const testcase = await load(`\
INPORT=Connect.IN:IN
OUTPORT=Disconnect.OUT:OUT

Connect(hedgehog-client/Connect)
Position(core/SendNext)  # caches a constant position value until a bang is received
Servo(hedgehog-client/Servo)
Disconnect(hedgehog-client/Disconnect)

0 -> port Servo
1 -> active Servo
2047 -> data Position
Connect out -> in Position out -> position Servo out -> in Disconnect
`);

            mock_server(server1,
                [[new servo.Action(0, true, 2047)], [new ack.Acknowledgement()]],
            );

            // pass a bang as the single network input
            assert.deepStrictEqual(await testcase(true), true);
        });
    });

    after(() => {
        server2.close();
        server2 = null;
    });

    after(() => {
        server1.close();
        server1 = null;
    });
});
