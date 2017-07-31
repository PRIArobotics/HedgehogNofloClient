import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';
import * as nUtils from '../lib/NofloUtils';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'sets a motor\'s velocity';
    c.icon = 'tachometer';
    c.inPorts.add('power', {
        datatype: 'number',
        description: 'motor power between +/-1000',
    });
    nUtils.addPortInPort(c, 'the motor port');
    nUtils.addEndpointInPort(c);
    c.outPorts.add('out', {
        datatype: 'bang',
        description: 'signals successful execution',
    });

    return c.process((input, output) => {
        if(!nUtils.available(input, 'power')) return;
        let power: number = input.getData('power');

        if(!nUtils.available(input, 'port')) return;
        let port: number = input.getData('port');

        nUtils.bangFromHedgehogClient(input, output, 'out', (hedgehog: HedgehogClient) => hedgehog.move(port, power));
    });
}
