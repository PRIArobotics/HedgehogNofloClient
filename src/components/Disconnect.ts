const noflo = require('noflo');
import { DEFAULT_ENDPOINT, connectionStore } from '../lib/ConnectionStore';

export function getComponent() {
    const c = new noflo.Component();
    c.description = 'Disconnects from a Hedgehog controller';
    c.icon = 'exchange';

    c.inPorts.add('conn', {
        datatype: 'string',
        control: true,
        default: DEFAULT_ENDPOINT,
    });

    c.outPorts.add('out', {
        datatype: 'bang',
        description: 'signals successful execution',
    });

    return c.process((input, output) => {
        if (!input.hasData('conn')) return;

        let endpoint: string = input.getData('conn');
        if(!connectionStore.getConnection(endpoint)) {
            //TODO error
        }

        connectionStore.disconnect(endpoint);

        output.sendDone({
            out: true,
        });
    });
}
