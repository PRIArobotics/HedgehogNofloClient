import "babel-polyfill";
import {connectionStore} from '../lib/ConnectionStore';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'Connects to a Hedgehog controller';
    c.icon = 'exchange';
    c.inPorts.add('connect', {
        datatype: 'bang',
        description: 'signal to connect to a controller',
    });
    c.inPorts.add('disconnect', {
        datatype: 'bang',
        description: 'signal to disconnect from a controller',
    });
    c.inPorts.add('endpoint', {
        datatype: 'string',
        description: 'the ZMQ endpoint to connect to',
        control: true,
        triggering: false,
    });
    c.outPorts.add('out', {
        datatype: 'string',
        description: 'the ZMQ endpoint to which there is a connection'
    });

    c.endpoint = null;

    function cleanUp() {
        if(c.endpoint) {
            console.log("disconnect", c.endpoint);
            connectionStore.disconnect(c.endpoint);
            c.endpoint = null;
        }
    }

    c.tearDown = (callback) => {
        cleanUp();
        callback();
    };

    return c.process((input, output) => {
        if(input.hasData('connect')) {
            input.get('connect');

            let endpoint: string = input.getData('endpoint');
            if(!endpoint)
                endpoint = 'tcp://localhost:10789';

            if(!c.endpoint || c.endpoint !== endpoint) {
                cleanUp();
                console.log("connect", endpoint);
                connectionStore.connect(endpoint);
                c.endpoint = endpoint;
            }
            output.sendDone({
                out: endpoint
            });
        } else if(input.hasData('disconnect')) {
            input.get('disconnect');

            cleanUp();
            output.sendDone({
                out: ''
            });
        }
    });
}

