import * as noflo from 'noflo';

// <GSL customizable: module-extras>
import { HedgehogClient } from 'hedgehog-client';
import { DEFAULT_ENDPOINT, connectionStore } from '../lib/ConnectionStore';
// </GSL customizable: module-extras>

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
        control: true,
        description: 'the analog port',
    });
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger a sensor request',
    });

    c.outPorts.add('endpoint', {
        datatype: 'string',
    });
    c.outPorts.add('out', {
        datatype: 'number',
        description: 'the sensor value',
    });

    // <default GSL customizable: component-extras />

    return c.process((input, output, context) => {
        if (!input.hasData('endpoint')) return;

        let endpoint: string = input.getData('endpoint');
        output.send({
            endpoint,
        });

        if (!(input.hasData('port', 'in'))) {
            output.done();
            return;
        }

        // <GSL customizable: component>
        let port: number = input.getData('port');
        input.get('in');

        let conn = connectionStore.getConnection(endpoint);
        if(!conn) {
            // TODO error
        }

        conn.getAnalog(port).then((value: number) => {
            output.sendDone({
                out: value,
            });
        });
        // </GSL customizable: component>
    });
}
