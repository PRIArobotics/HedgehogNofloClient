import * as noflo from 'noflo';

// <default GSL customizable: module-extras />

export function getComponent() {
    let c = new noflo.Component();
    c.description = 'Selects one of two values according to a boolean';
    c.icon = 'question';

    c.inPorts.add('true_value', {
        datatype: 'all',
        control: true,
    });
    c.inPorts.add('false_value', {
        datatype: 'all',
        control: true,
    });
    c.inPorts.add('in', {
        datatype: 'boolean',
    });

    c.outPorts.add('out', {
        datatype: 'all',
    });

    // <default GSL customizable: component-extras />

    return c.process((input, output, context) => {

        if (!(input.hasData('true_value', 'false_value', 'in'))) {
            output.done();
            return;
        }

        // <GSL customizable: component>
        let trueValue: number = input.getData('true_value');
        let falseValue: number = input.getData('false_value');
        let cond: boolean = input.getData('in');

        output.sendDone({
            out: cond ? trueValue : falseValue,
        });
        // </GSL customizable: component>
    });
}
