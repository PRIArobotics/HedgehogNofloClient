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
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger a sensor request',
    });

    c.outPorts.add('conn', {
        datatype: 'string',
        description: 'returns the connection after successful execution',
    });
    c.outPorts.add('out', {
        datatype: 'boolean',
        description: 'the sensor value',
    });

    return c.process((input, output) => {
        if (!input.hasData('conn', 'port', 'in')) return;

        let endpoint: string = input.getData('conn');
        let port: number = input.getData('port');
        input.get('in');

        let conn = connectionStore.getConnection(endpoint);
        if(!conn) {
            //TODO error
        }

        conn.getDigital(port).then((value: boolean) => {
            output.sendDone({
                conn: endpoint,
                out: value,
            });
        });
    });
}
