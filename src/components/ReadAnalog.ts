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
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger a sensor request',
    });

    c.outPorts.add('endpoint', {
        datatype: 'string',
        description: 'returns the connection after successful execution',
    });
    c.outPorts.add('out', {
        datatype: 'number',
        description: 'the sensor value',
    });

    return c.process((input, output) => {
        if (!input.hasData('endpoint')) return;

        let endpoint: string = input.getData('endpoint');
        output.send({
            endpoint,
        });

        if (!input.hasData('port', 'in')) {
            output.done();
            return;
        }

        let port: number = input.getData('port');
        input.get('in');

        let conn = connectionStore.getConnection(endpoint);
        if(!conn) {
            //TODO error
        }

        conn.getAnalog(port).then((value: number) => {
            output.sendDone({
                out: value,
            });
        });
    });
}
