import "babel-polyfill";

let noflo: any = require('noflo');

if(!noflo.isBrowser()) {
    let util: any = require('util');
} else {
    let util = {
        inspect: (data: any) => data
    }
}

function log(data: any): void {
    console.log(data);
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

    return c.process((input, output) => {
        if(!input.hasData('in')) return;

        let data: any = input.getData('in');
        console.log(data);
        return output.sendDone({
            out: data
        });
    });
}

