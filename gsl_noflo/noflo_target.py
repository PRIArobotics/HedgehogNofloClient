import os.path
import re

from gsl import lines, generate
from gsl.strings import case

from . import unique


def generate_code(model, root='.'):
    for component in model.components:
        generate_component_code(model, component, root)


def generate_component_code(model, component, root):
    out_file = os.path.join(root, 'src/components', f'{component.name}.ts')
    os.makedirs(os.path.dirname(out_file), exist_ok=True)

    in_templates = {
        'endpoint': {
            'name': 'endpoint',
            'datatype': 'string',
            'control': True,
            'default': 'DEFAULT_ENDPOINT',
        },
        'port': {
            'name': 'port',
            'datatype': 'number',
            'control': True,
        },
        'in-bang': {
            'name': 'in',
            'datatype': 'bang',
        },
    }

    out_templates = {
        'endpoint': {
            'name': 'endpoint',
            'datatype': 'string',
        },
        'out-bang': {
            'name': 'out',
            'datatype': 'bang',
        },
    }

    def get_js_value(property, *, in_port=None, out_port=None):
        if in_port and out_port:
            raise ValueError
        elif in_port:
            port = in_port
            templates = in_templates
        elif out_port:
            port = out_port
            templates = out_templates
        else:
            raise ValueError

        try:
            value = port[property]
        except KeyError as err:
            try:
                template_name = port.template
            except AttributeError:
                raise err
            try:
                template = templates[template_name]
                value = template[property]
            except AttributeError:
                raise err

        def js_bool(value):
            return repr(bool(value)).lower()

        escape = {
            'name': repr,  # string in quotes
            'datatype': repr,  # string in quotes
            'control': js_bool,  # lowercase boolean constant
            'default': str,  # verbatim default expression
            'description': repr,  # string in quotes
        }

        return escape[property](value)

    @generate(out_file)
    def code():
        yield from lines(f"""\
import * as noflo from 'noflo';

// <default GSL customizable: module-extras />

export function getComponent() {{
    let c = new noflo.Component();
    c.description = {component.description!r};
    c.icon = {component.icon!r};

""")

        for port in component.inPorts:
            yield from lines(f"""\
    c.inPorts.add({get_js_value('name', in_port=port)}, {{
""")
            for prop in ['datatype', 'control', 'default', 'description']:
                try:
                    prop_value = get_js_value(prop, in_port=port)
                except KeyError:
                    pass
                else:
                    yield from lines(f"""\
        {prop}: {prop_value},
""")
            yield from lines(f"""\
    }});
""")
        yield from lines(f"""\

""")
        for port in component.outPorts:
            yield from lines(f"""\
    c.outPorts.add({get_js_value('name', out_port=port)}, {{
""")
            for prop in ['datatype', 'description']:
                try:
                    prop_value = get_js_value(prop, out_port=port)
                except KeyError:
                    pass
                else:
                    yield from lines(f"""\
        {prop}: {prop_value},
""")
            yield from lines(f"""\
    }});
""")
        yield from lines(f"""\

    // <default GSL customizable: component-extras />

    return c.process((input, output, context) => {{
""")
        if any(port.get('template', None) == 'endpoint' for port in component.inPorts):
            yield from lines(f"""\
        if (!input.hasData('endpoint')) return;

        let endpoint: string = input.getData('endpoint');
""")
        if any(port.get('template', None) == 'endpoint' for port in component.outPorts):
            yield from lines(f"""\
        output.send({{
            endpoint,
        }});
""")
        preconditions = component.preconditions
        preconditions = re.sub(r"(\w+)", r"'\1'", preconditions)
        preconditions = re.sub(r"('\w+'(?:\s*,\s*'\w+')*)", r"input.hasData(\1)", preconditions)
        yield from lines(f"""\

        if (!({preconditions})) {{
            output.done();
            return;
        }}
""")
        yield from lines(f"""\

        // <default GSL customizable: component>
        output.done();
        // </GSL customizable: component>
    }});
}}
""")
