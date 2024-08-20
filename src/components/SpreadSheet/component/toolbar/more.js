import Dropdown from '../dropdown.js';

import { cssPrefix } from '../../config.js';
import { h } from '../element.js';
import Icon from '../icon.js';
import DropdownItem from './dropdown_item.js';

class DropdownMore extends Dropdown {
  constructor() {
    const icon = new Icon('ellipsis');
    const moreBtns = h('div', `${cssPrefix}-toolbar-more`);
    super(icon, 'auto', false, 'bottom-right', moreBtns);
    this.moreBtns = moreBtns;
    this.contentEl.css('max-width', '420px');
  }
}

export default class More extends DropdownItem {
  constructor() {
    super('more');
    this.el.hide();
  }

  dropdown() {
    return new DropdownMore();
  }

  show() {
    this.el.show();
  }

  hide() {
    this.el.hide();
  }
}
