import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from './ConnectionStore';

let noflo: any = require('noflo');

export function addPortInPort(c, description: string = 'the port') {
    c.inPorts.add('port', {
        datatype: 'number',
        description,
        control: true,
        triggering: false,
    });
}

export function addEndpointInPort(c) {
    c.inPorts.add('endpoint', {
        datatype: 'string',
        description: 'the ZMQ endpoint to talk to',
        control: true,
        triggering: false,
    });
}

export function available(input, inPort: string): boolean {
    if(!input.hasData(inPort)) {
        input.context.deactivate();
        return false;
    }
    return true;
}

export function consume(input, inPort: string): boolean {
    if(!available(input, inPort)) return false;
    input.get(inPort);
    return true;
}

export function returnFromHedgehogClient<T>(input, output, outPort: string, call: (hedgehog: HedgehogClient) => Promise<T>) {
    if(!input.hasData('endpoint')) {
        output.done();
        return;
    }

    let endpoint: string = input.getData('endpoint');
    if(!endpoint) {
        output.done();
        return;
    }

    let hedgehog: HedgehogClient = connectionStore.getConnection(endpoint);
    call(hedgehog).then((value: T) => {
        output.sendDone({
            out: value
        });
    });
}
