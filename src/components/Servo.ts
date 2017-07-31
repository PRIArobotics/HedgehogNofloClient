import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';
import * as nUtils from '../lib/NofloUtils';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'writes an IO port\'s config flags';
    c.icon = 'tachometer';
    c.inPorts.add('active', {
        datatype: 'boolean',
        description: 'whether to enable the servo',
        control: true,
    });
    c.inPorts.add('position', {
        datatype: 'number',
        description: 'servo position between 0-4095',
        control: true,
    });
    nUtils.addPortInPort(c, 'the servo port');
    nUtils.addEndpointInPort(c);
    c.outPorts.add('out', {
        datatype: 'bang',
        description: 'signals successful execution',
    });

    return c.process((input, output) => {
        if(!nUtils.available(input, 'active')) return;
        if(!nUtils.available(input, 'position')) return;
        let active: boolean = input.getData('active');
        let position: number = input.getData('position');

        if(!nUtils.available(input, 'port')) return;
        let port: number = input.getData('port');

        nUtils.bangFromHedgehogClient(input, output, 'out', (hedgehog: HedgehogClient) => hedgehog.setServo(port, active, position));
    });
}
