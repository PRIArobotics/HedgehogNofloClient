import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from './ConnectionStore';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'reads an analog sensor';
    c.icon = 'area-chart';
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger a sensor request'
    });
    c.inPorts.add('port', {
        datatype: 'number',
        description: 'the sensor port'
    });
    c.inPorts.add('endpoint', {
        datatype: 'string',
        description: 'the ZMQ endpoint to talk to'
    });
    c.outPorts.add('out', {
        datatype: 'number',
        description: 'the sensor value'
    });

    return noflo.helpers.WirePattern(c, {
        in: 'in',
        params: ['port', 'endpoint'],
        out: 'out',
        async: true,
    }, (data, groups, out, done) => {
        let port: number = c.params.port;
        let endpoint: string = c.params.endpoint;

        if(endpoint) {
            let hedgehog: HedgehogClient = connectionStore.getConnection(endpoint);
            hedgehog.getAnalog(port).then((value: number) => {
                out.send(value);
                done();
            });
        } else {
            done();
        }
    });
}
