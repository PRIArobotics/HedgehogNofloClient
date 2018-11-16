import * as noflo from 'noflo';

// <default GSL customizable: module-extras />

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'Selects one of two output signals according to a threshold';
    c.icon = 'check';

    c.inPorts.add('threshold', {
        datatype: 'number',
        control: true,
    });
    c.inPorts.add('in', {
        datatype: 'number',
    });

    c.outPorts.add('lt', {
        datatype: 'bang',
        description: 'signalled if the input was less than the threshold',
    });
    c.outPorts.add('ge', {
        datatype: 'bang',
        description: 'signalled if the input was greater than or equal to the threshold',
    });

    // <default GSL customizable: component-extras />

    return c.process((input, output, context) => {

        if (!(input.hasData('threshold', 'in'))) {
            output.done();
            return;
        }

        // <GSL customizable: component>
        let threshold: number = input.getData('threshold');
        let value: number = input.getData('in');

        if (value < threshold) {
            output.sendDone({
                lt: true,
            });
        } else {
            output.sendDone({
                ge: true,
            });
        }
        // </GSL customizable: component>
    });
}
