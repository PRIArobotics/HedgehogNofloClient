import os.path

from gsl.yaml import YAML

NOFLO_MODEL = os.path.join(os.path.dirname(__file__), 'noflo.yaml')


def unique(it):
    items = set()
    for item in it:
        if item not in items:
            items.add(item)
            yield item


def get_model(model_file=None):
    if model_file is None:
        model_file = NOFLO_MODEL

    with open(model_file) as f:
        yaml = YAML(typ='safe')
        model = yaml.load(f)

    return model


def main():
    from . import noflo_target

    model = get_model()
    root = '.'
    noflo_target.generate_code(model, root)
