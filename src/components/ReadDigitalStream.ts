const noflo = require('noflo');
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'reads a digital sensor';
    c.icon = 'area-chart';

    c.inPorts.add('conn', {
        datatype: 'string',
        control: true,
        default: 'tcp://localhost:10789',
    });

    c.inPorts.add('port', {
        datatype: 'number',
        description: 'the motor port',
        control: true,
    });
    c.inPorts.add('start', {
        datatype: 'bang',
        description: 'Start the stream of sensor values',
    });
    c.inPorts.add('stop', {
        datatype: 'bang',
        description: 'Stop the stream of sensor values',
    });

    c.outPorts.add('conn', {
        datatype: 'string',
        description: 'returns the connection after the stream was stopped',
    });
    c.outPorts.add('out', {
        datatype: 'boolean',
        description: 'the sensor values',
    });

    c.contexts = {};

    const cleanUp = (scope) => {
        if (!c.contexts[scope]) return;

        clearInterval(c.contexts[scope].interval);
        c.contexts[scope].deactivate();
        delete c.contexts[scope];
    };

    c.tearDown = (callback) => {
        Object.keys(c.contexts).forEach(cleanUp);
        callback();
    };

    return c.process((input, output, context) => {
        if (!input.hasData('conn', 'port')) return;

        if (!input.hasData('start') && !input.hasData('stop')) return;

        let endpoint: string = input.getData('conn');
        let port: number = input.getData('port');

        let conn = connectionStore.getConnection(endpoint);
        if(!conn) {
            //TODO error
        }

        if (input.hasData('start')) {
            const scope = input.get('start').scope;

            cleanUp(scope);
            context.interval = setInterval(() => {
                conn.getDigital(port).then((value: boolean) => {
                    output.send({
                        out: value,
                    });
                });
            }, 50);
            c.contexts[scope] = context;
        }
        if (input.hasData('stop')) {
            const scope = input.get('stop').scope;

            cleanUp(scope);
            output.sendDone({
                conn: endpoint,
            });
        }
    });
}
