import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';
import * as nUtils from '../lib/NofloUtils';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'writes an IO port\'s config flags';
    c.icon = 'sliders';
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger a IO config action',
    });
    nUtils.addPortInPort(c, 'the IO port');
    c.inPorts.add('pullup', {
        datatype: 'boolean',
        description: 'whether to configure pullup',
        control: true,
        triggering: false,
    });
    nUtils.addEndpointInPort(c);
    c.outPorts.add('out', {
        datatype: 'bang',
        description: 'signals successful execution',
    });

    return c.process((input, output) => {
        if(!nUtils.consume(input, 'in')) return;

        if(!nUtils.available(input, 'port')) return;
        let port: number = input.getData('port');

        if(!nUtils.available(input, 'pullup')) return;
        let pullup: boolean = input.getData('pullup');

        nUtils.bangFromHedgehogClient(input, output, 'out', (hedgehog) => hedgehog.setInputState(port, pullup));
    });
}
