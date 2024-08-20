import DropdownFormat from '../dropdown_format.js';
import DropdownItem from './dropdown_item.js';

export default class Format extends DropdownItem {
  constructor() {
    super('format');
  }

  getValue(it) {
    return it.key;
  }

  dropdown() {
    return new DropdownFormat();
  }
}
