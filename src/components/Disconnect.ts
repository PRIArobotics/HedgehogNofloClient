const noflo = require('noflo');
import { DEFAULT_ENDPOINT, connectionStore } from '../lib/ConnectionStore';

export function getComponent() {
    const c = new noflo.Component();
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

    return c.process((input, output) => {
        if (!input.hasData('endpoint', 'in')) return;

        let endpoint: string = input.getData('endpoint');
        input.get('in');

        if(!connectionStore.getConnection(endpoint)) {
            //TODO error
        }

        connectionStore.disconnect(endpoint);

        output.sendDone({
            out: true,
        });
    });
}
