import DropdownBorder from '../dropdown_border.js';
import DropdownItem from './dropdown_item.js';

export default class Border extends DropdownItem {
  constructor() {
    super('border');
  }

  dropdown() {
    return new DropdownBorder();
  }
}
