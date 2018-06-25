const noflo = require('noflo');
import {connectionStore} from '../lib/ConnectionStore';

export function getComponent() {
    const c = new noflo.Component();
    c.description = 'Connects to a Hedgehog controller';
    c.icon = 'exchange';

    c.inPorts.add('endpoint', {
        datatype: 'string',
        default: 'tcp://localhost:10789',
    });

    c.outPorts.add('conn', {
        datatype: 'string',
    });

    return c.process((input, output) => {
        if (!input.hasData('endpoint')) return;

        let endpoint: string = input.getData('endpoint');
        if(connectionStore.getConnection(endpoint)) {
            //TODO error
        }

        connectionStore.connect(endpoint);

        output.sendDone({
            conn: endpoint,
        });
    });
}
