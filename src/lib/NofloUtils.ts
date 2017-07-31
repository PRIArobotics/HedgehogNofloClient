let noflo: any = require('noflo');

export function addPortInPort(c, description: string = 'the port') {
    c.inPorts.add('port', {
        datatype: 'number',
        description,
        control: true,
        triggering: false,
    });
}

export function addEndpointInPort(c) {
    c.inPorts.add('endpoint', {
        datatype: 'string',
        description: 'the ZMQ endpoint to talk to',
        control: true,
        triggering: false,
    });
}
