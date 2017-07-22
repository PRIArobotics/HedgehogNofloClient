import "babel-polyfill";

let noflo: any = require('noflo');

if(!noflo.isBrowser()) {
    let util: any = require('util');
} else {
    let util = {
        inspect: (data: any) => data
    }
}

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'Sends the data items to console.log';
    c.icon = 'bug';
    c.inPorts.add('in', {
        datatype: 'all',
        description: 'Packet to be printed through console.log'
    });
    c.outPorts.add('out', {
        datatype: 'all'
    });

    c.setUp = (callback) => {
        console.log("setUp");
        callback();
    };
    c.tearDown = (callback) => {
        console.log("tearDown");
        callback();
    };

    return c.process((input, output) => {
        if(!input.hasData('in')) return;

        let data: any = input.getData('in');
        console.log(data);
        output.sendDone({
            out: data
        });
    });
}

