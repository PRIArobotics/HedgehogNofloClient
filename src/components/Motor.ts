import * as noflo from 'noflo';

// <GSL customizable: module-extras>
import { HedgehogClient } from 'hedgehog-client';
import { DEFAULT_ENDPOINT, connectionStore } from '../lib/ConnectionStore';
// </GSL customizable: module-extras>

export function getComponent() {
    let c = new noflo.Component();
    c.description = "sets a motor's power";
    c.icon = 'tachometer';

    c.inPorts.add('endpoint', {
        datatype: 'string',
        control: true,
        default: DEFAULT_ENDPOINT,
    });
    c.inPorts.add('port', {
        datatype: 'number',
        control: true,
        description: 'the motor port',
    });
    c.inPorts.add('power', {
        datatype: 'number',
        description: 'motor power between ±1000',
    });

    c.outPorts.add('endpoint', {
        datatype: 'string',
    });
    c.outPorts.add('out', {
        datatype: 'bang',
        description: 'signals successful execution',
    });

    // <default GSL customizable: component-extras />

    return c.process((input, output, context) => {
        if (!input.hasData('endpoint')) return;

        let endpoint: string = input.getData('endpoint');
        output.send({
            endpoint,
        });

        if (!(input.hasData('port', 'power'))) {
            output.done();
            return;
        }

        // <GSL customizable: component>
        let port: number = input.getData('port');
        let power: number = input.getData('power');

        let conn = connectionStore.getConnection(endpoint);
        if(!conn) {
            // TODO error
        }

        conn.move(port, power).then(() => {
            output.sendDone({
                out: true,
            });
        });
        // </GSL customizable: component>
    });
}
