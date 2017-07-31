import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';
import * as nUtils from '../lib/NofloUtils';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'reads an IO port\'s config flags';
    c.icon = 'area-chart';
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger a IO config request',
    });
    nUtils.addPortInPort(c, 'the IO port');
    nUtils.addEndpointInPort(c);
    c.outPorts.add('out', {
        datatype: 'number',
        description: 'the IO config flags',
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
        hedgehog.getIOConfig(port).then((value: number) => {
            output.sendDone({
                out: value
            });
        });
    });
}
