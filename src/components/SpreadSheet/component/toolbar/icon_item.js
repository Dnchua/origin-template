import Icon from '../icon.js';
import Item from './item.js';

export default class IconItem extends Item {
  element() {
    return super
      .element()
      .child(new Icon(this.tag))
      .on('click', () => this.change(this.tag));
  }

  setState(disabled) {
    this.el.disabled(disabled);
  }
}
