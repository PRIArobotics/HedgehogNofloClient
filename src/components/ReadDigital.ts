import "babel-polyfill";
import {HedgehogClient} from 'hedgehog-client';
import {connectionStore} from '../lib/ConnectionStore';
import * as nUtils from '../lib/NofloUtils';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'reads a digital sensor';
    c.icon = 'area-chart';
    c.inPorts.add('in', {
        datatype: 'bang',
        description: 'signal to trigger a sensor request',
    });
    nUtils.addPortInPort(c, 'the sensor port');
    nUtils.addEndpointInPort(c);
    c.outPorts.add('out', {
        datatype: 'boolean',
        description: 'the sensor value',
    });

    return c.process((input, output) => {
        if(!nUtils.consume(input, 'in')) return;

        if(!nUtils.available(input, 'port')) return;
        let port: number = input.getData('port');

        nUtils.returnFromHedgehogClient(input, output, (hedgehog) => hedgehog.getDigital(port));
    });
}
