import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'reads an analog sensor';
    c.icon = 'area-chart';
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger a sensor request',
    });
    c.inPorts.add('port', {
        datatype: 'number',
        description: 'the sensor port',
        control: true,
        triggering: false,
    });
    c.inPorts.add('endpoint', {
        datatype: 'string',
        description: 'the ZMQ endpoint to talk to',
        control: true,
        triggering: false,
    });
    c.outPorts.add('out', {
        datatype: 'number',
        description: 'the sensor value'
    });

    return c.process((input, output) => {
        if(!input.hasData('in')) return;
        input.get('in');

        if(!(input.hasData('port') && input.hasData('endpoint'))) {
            output.done();
            return;
        }

        let port: number = input.getData('port');
        let endpoint: string = input.getData('endpoint');
        if(!endpoint) {
            output.done();
            return;
        }

        let hedgehog: HedgehogClient = connectionStore.getConnection(endpoint);
        hedgehog.getAnalog(port).then((value: number) => {
            output.sendDone({
                out: value
            });
        });
    });
}
