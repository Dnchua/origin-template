import DropdownFormula from '../dropdown_formula.js';
import DropdownItem from './dropdown_item.js';

export default class Format extends DropdownItem {
  constructor() {
    super('formula');
  }

  getValue(it) {
    return it.key;
  }

  dropdown() {
    return new DropdownFormula();
  }
}
