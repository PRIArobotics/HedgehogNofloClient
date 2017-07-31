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
        if(!input.hasData('in')) return;
        input.get('in');

        if(!input.hasData('port')) {
            output.done();
            return;
        }

        let port: number = input.getData('port');
        nUtils.returnFromHedgehogClient(input, output, (hedgehog) => hedgehog.getDigital(port));
    });
}
