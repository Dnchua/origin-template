import { fontSizes } from '../core/font.js';
import { cssPrefix } from '../config.js';
import Dropdown from './dropdown.js';
import { h } from './element.js';

export default class DropdownFontSize extends Dropdown {
  constructor() {
    const nfontSizes = fontSizes.map(it =>
      h('div', `${cssPrefix}-item`)
        .on('click', () => {
          this.setTitle(`${it.pt}`);
          this.change(it);
        })
        .child(`${it.pt}`),
    );
    super('10', '60px', true, 'bottom-left', ...nfontSizes);
  }
}
