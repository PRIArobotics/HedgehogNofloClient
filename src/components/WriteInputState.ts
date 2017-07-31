import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import * as nUtils from '../lib/NofloUtils';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'writes an IO port\'s config flags';
    c.icon = 'sliders';
    c.inPorts.add('pullup', {
        datatype: 'boolean',
        description: 'whether to configure pullup',
    });
    nUtils.addPortInPort(c, 'the IO port');
    nUtils.addEndpointInPort(c);
    c.outPorts.add('out', {
        datatype: 'bang',
        description: 'signals successful execution',
    });

    return c.process((input, output) => {
        if(!nUtils.available(input, 'pullup')) return;
        let pullup: boolean = input.getData('pullup');

        if(!nUtils.available(input, 'port')) return;
        let port: number = input.getData('port');

        nUtils.bangFromHedgehogClient(input, output, 'out', (hedgehog: HedgehogClient) => hedgehog.setInputState(port, pullup));
    });
}
