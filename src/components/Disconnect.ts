const noflo = require('noflo');
import {connectionStore} from '../lib/ConnectionStore';

export function getComponent() {
    const c = new noflo.Component();
    c.description = 'Disconnects from a Hedgehog controller';
    c.icon = 'exchange';

    c.inPorts.add('conn', {
        datatype: 'string',
        control: true,
        default: 'tcp://localhost:10789',
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
