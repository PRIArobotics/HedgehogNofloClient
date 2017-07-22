import "babel-polyfill";
import {connectionStore} from './ConnectionStore';

let noflo: any = require('noflo');

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'Connects to a Hedgehog controller';
    c.icon = 'exchange';
    c.inPorts.add('in', {
        datatype: 'string',
        description: 'the ZMQ endpoint to connect to'
    });
    c.outPorts.add('out', {
        datatype: 'string',
        description: 'the ZMQ endpoint to which there is a connection'
    });

    c.endpoints = {};

    function cleanUp(scope) {
        let endpoint = c.endpoints[scope];
        if(endpoint) {
            connectionStore.disconnect(endpoint);
            console.log("cleanUp", endpoint);
            c.endpoints[scope] = null;
        }
    }

    c.tearDown = (callback) => {
        console.log("tearDown");
        for(let scope in c.endpoints)
            cleanUp(scope);
        c.contexts = {};
        callback();
    };

    return c.process((input, output) => {
        if(!input.hasData('in')) return;

        let ip = input.get('in');

        // normalize endpoint by filling in the default when '' is given
        let endpoint: string = ip.data;
        if(endpoint === '')
            endpoint = 'tcp://localhost:10789';

        let oldEndpoint = c.endpoints[ip.scope];

        console.log("process", endpoint);

        if(endpoint === null) {
            cleanUp(ip.scope);
            output.sendDone({
                out: null
            });
        } else if(oldEndpoint && oldEndpoint === endpoint) {
            output.done();
        } else {
            cleanUp(ip.scope);

            console.log("connect", endpoint);
            connectionStore.connect(endpoint);
            c.endpoints[ip.scope] = endpoint;
            output.sendDone({
                out: endpoint
            });
        }
    });
}

