import { baseFormulas } from '../core/formula.js';
import { cssPrefix } from '../config.js';
import Dropdown from './dropdown.js';
import Icon from './icon.js';
import { h } from './element.js';

export default class DropdownFormula extends Dropdown {
  constructor() {
    const nformulas = baseFormulas.map(it =>
      h('div', `${cssPrefix}-item`)
        .on('click', () => {
          this.hide();
          this.change(it);
        })
        .child(it.key),
    );
    super(new Icon('formula'), '180px', true, 'bottom-left', ...nformulas);
  }
}
