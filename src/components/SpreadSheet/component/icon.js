import { cssPrefix } from '../config.js';
import { Element, h } from './element.js';

export default class Icon extends Element {
  constructor(name) {
    super('div', `${cssPrefix}-icon`);
    this.iconNameEl = h('div', `${cssPrefix}-icon-img ${name}`);
    this.child(this.iconNameEl);
  }

  setName(name) {
    this.iconNameEl.className(`${cssPrefix}-icon-img ${name}`);
  }
}
