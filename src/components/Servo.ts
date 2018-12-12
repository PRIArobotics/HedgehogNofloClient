import * as noflo from 'noflo';

// <GSL customizable: module-extras>
import { HedgehogClient } from 'hedgehog-client';
import { DEFAULT_ENDPOINT, connectionStore } from '../lib/ConnectionStore';
// </GSL customizable: module-extras>

export function getComponent() {
    let c = new noflo.Component();
    c.description = "sets a servo's position";
    c.icon = 'tachometer';

    c.inPorts.add('endpoint', {
        datatype: 'string',
        control: true,
        default: DEFAULT_ENDPOINT,
    });
    c.inPorts.add('port', {
        datatype: 'number',
        control: true,
        description: 'the servo port',
    });
    c.inPorts.add('active', {
        datatype: 'boolean',
        control: true,
        description: 'whether to enable the servo',
    });
    c.inPorts.add('position', {
        datatype: 'number',
        control: true,
        description: 'servo position between 0-4095',
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

        if (!(input.hasData('port', 'active'))) {
            output.done();
            return;
        }

        // <GSL customizable: component>
        let port: number = input.getData('port');
        let active: boolean = input.getData('active');

        if (active && !input.hasData('position')) {
            output.done();
            return;
        }

        let position: number = input.getData('position');

        let conn = connectionStore.getConnection(endpoint);
        if(!conn) {
            // TODO error
        }

        conn.setServo(port, active, position).then(() => {
            output.sendDone({
                out: true,
            });
        });
        // </GSL customizable: component>
    });
}
