import DropdownAlign from '../dropdown_align.js';
import DropdownItem from './dropdown_item.js';

export default class Align extends DropdownItem {
  constructor(value) {
    super('align', '', value);
  }

  dropdown() {
    const { value } = this;
    return new DropdownAlign(['left', 'center', 'right'], value);
  }
}
