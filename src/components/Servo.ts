const noflo = require('noflo');
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'sets a servo\'s position';
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
    c.inPorts.add('active', {
        datatype: 'boolean',
        description: 'whether to enable the servo',
        control: true,
    });
    c.inPorts.add('position', {
        datatype: 'number',
        description: 'servo position between 0-4095',
    });

    c.outPorts.add('conn', {
        datatype: 'string',
        description: 'returns the connection after successful execution',
    });

    return c.process((input, output) => {
        if (!input.hasData('conn', 'port', 'active', 'position')) return;

        let endpoint: string = input.getData('conn');
        let port: number = input.getData('port');
        let active: boolean = input.getData('active');
        let position: number = input.getData('position');

        let conn = connectionStore.getConnection(endpoint);
        if(!conn) {
            //TODO error
        }

        conn.setServo(port, active, position).then(() => {
            output.sendDone({
                conn: endpoint,
            });
        });
    });
}
