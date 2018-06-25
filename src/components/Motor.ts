const noflo = require('noflo');
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';

export function getComponent() {
    const c = new noflo.Component();
    c.description = 'sets a motor\'s velocity';
    c.icon = 'tachometer';

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
    c.inPorts.add('power', {
        datatype: 'number',
        description: 'motor power between +/-1000',
    });

    c.outPorts.add('conn', {
        datatype: 'string',
        description: 'returns the connection after successful execution',
    });

    return c.process((input, output) => {
        if (!input.hasData('conn', 'port', 'power')) return;

        let endpoint: string = input.getData('conn');
        let port: number = input.getData('port');
        let power: number = input.getData('power');

        let conn = connectionStore.getConnection(endpoint);
        if(!conn) {
            //TODO error
        }

        conn.move(port, power).then(() => {
            output.sendDone({
                conn: endpoint,
            });
        });
    });
}
