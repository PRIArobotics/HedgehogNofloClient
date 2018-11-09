import * as noflo from 'noflo';

// <GSL customizable: module-extras>
import { DEFAULT_ENDPOINT, connectionStore } from '../lib/ConnectionStore';
// </GSL customizable: module-extras>

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'Disconnects from a Hedgehog controller';
    c.icon = 'exchange';

    c.inPorts.add('endpoint', {
        datatype: 'string',
        control: true,
        default: DEFAULT_ENDPOINT,
    });
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger disconnect',
    });

    c.outPorts.add('out', {
        datatype: 'bang',
        description: 'signals successful execution',
    });

    // <default GSL customizable: component-extras />

    return c.process((input, output, context) => {
        if (!input.hasData('endpoint')) return;

        let endpoint: string = input.getData('endpoint');

        if (!(input.hasData('in'))) {
            output.done();
            return;
        }

        // <GSL customizable: component>
        input.get('in');

        if(!connectionStore.getConnection(endpoint)) {
            // TODO error
        }

        connectionStore.disconnect(endpoint);

        output.sendDone({
            out: true,
        });
        // </GSL customizable: component>
    });
}
