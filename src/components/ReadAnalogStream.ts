const noflo = require('noflo');
import { HedgehogClient } from 'hedgehog-client';
import { DEFAULT_ENDPOINT, connectionStore } from '../lib/ConnectionStore';

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'reads an analog sensor';
    c.icon = 'area-chart';

    c.inPorts.add('endpoint', {
        datatype: 'string',
        control: true,
        default: DEFAULT_ENDPOINT,
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

    c.outPorts.add('endpoint', {
        datatype: 'string',
        description: 'returns the connection after successful execution',
    });
    c.outPorts.add('out', {
        datatype: 'number',
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
        if (!input.hasData('endpoint')) return;

        let endpoint: string = input.getData('endpoint');
        output.send({
            endpoint,
        });

        if (!input.hasData('port') || (!input.hasData('start') && !input.hasData('stop'))) {
            output.done();
            return;
        }

        let port: number = input.getData('port');

        let conn = connectionStore.getConnection(endpoint);
        if(!conn) {
            //TODO error
        }

        if (input.hasData('start')) {
            const scope = input.get('start').scope;

            cleanUp(scope);
            context.interval = setInterval(() => {
                conn.getAnalog(port).then((value: number) => {
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
            output.done();
        }
    });
}
