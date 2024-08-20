import Item from './item.js';

export default class DropdownItem extends Item {
  dropdown() {
    console.log('empty function');
  }

  getValue(v) {
    return v;
  }

  element() {
    const { tag } = this;
    this.dd = this.dropdown();
    this.dd.change = it => this.change(tag, this.getValue(it));
    return super.element().child(this.dd);
  }

  setState(v) {
    if (v) {
      this.value = v;
      this.dd.setTitle(v);
    }
  }
}
