import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';
import * as nUtils from '../lib/NofloUtils';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'writes an IO port\'s config flags';
    c.icon = 'toggle-on';
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger a digital output action',
    });
    nUtils.addPortInPort(c, 'the IO port');
    c.inPorts.add('on', {
        datatype: 'boolean',
        description: 'whether to turn the output on',
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

        if(!nUtils.available(input, 'on')) return;
        let on: boolean = input.getData('on');

        nUtils.bangFromHedgehogClient(input, output, 'out', (hedgehog) => hedgehog.setDigitalOutput(port, on));
    });
}
