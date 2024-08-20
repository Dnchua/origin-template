import { cssPrefix } from '../config.js';
import { t } from '../locale/locale.js';
import { Element } from './element.js';

export default class Button extends Element {
  // type: primary
  constructor(title, type = '') {
    super('div', `${cssPrefix}-button ${type}`);
    this.child(t(`button.${title}`));
  }
}
