import DropdownColor from '../dropdown_color.js';
import DropdownItem from './dropdown_item.js';

export default class TextColor extends DropdownItem {
  constructor(color) {
    super('color', undefined, color);
  }

  dropdown() {
    const { tag, value } = this;
    return new DropdownColor(tag, value);
  }
}
