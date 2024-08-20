import { cssPrefix } from '../config.js';
import Dropdown from './dropdown.js';
import { h } from './element.js';
import Icon from './icon.js';

function buildItemWithIcon(iconName) {
  return h('div', `${cssPrefix}-item`).child(new Icon(iconName));
}

export default class DropdownAlign extends Dropdown {
  constructor(aligns, align) {
    const icon = new Icon(`align-${align}`);
    const naligns = aligns.map(it =>
      buildItemWithIcon(`align-${it}`).on('click', () => {
        this.setTitle(it);
        this.change(it);
      }),
    );
    super(icon, 'auto', true, 'bottom-left', ...naligns);
  }

  setTitle(align) {
    this.title.setName(`align-${align}`);
    this.hide();
  }
}
