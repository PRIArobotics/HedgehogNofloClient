import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';
import * as nUtils from '../lib/NofloUtils';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'turns a digital output on or off';
    c.icon = 'toggle-on';
    c.inPorts.add('on', {
        datatype: 'boolean',
        description: 'whether to turn the output on',
    });
    nUtils.addPortInPort(c, 'the IO port');
    nUtils.addEndpointInPort(c);
    c.outPorts.add('out', {
        datatype: 'bang',
        description: 'signals successful execution',
    });

    return c.process((input, output) => {
        if(!nUtils.available(input, 'on')) return;
        let on: boolean = input.getData('on');

        if(!nUtils.available(input, 'port')) return;
        let port: number = input.getData('port');

        nUtils.bangFromHedgehogClient(input, output, 'out', (hedgehog) => hedgehog.setDigitalOutput(port, on));
    });
}
