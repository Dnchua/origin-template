const imageMap = new Map();

function dpr() {
  return window.devicePixelRatio || 1;
}

function thinLineWidth() {
  return dpr() - 0.5;
}

function npx(px) {
  return parseInt(px * dpr(), 10);
}

function npxLine(px) {
  const n = npx(px);
  return n > 0 ? n - 0.5 : 0.5;
}

class DrawBox {
  constructor(x, y, w, h, padding = 0) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.padding = padding;
    this.bgcolor = '#ffffff';
    // border: [width, style, color]
    this.borderTop = null;
    this.borderRight = null;
    this.borderBottom = null;
    this.borderLeft = null;
  }

  setBorders({ top, bottom, left, right }) {
    if (top) this.borderTop = top;
    if (right) this.borderRight = right;
    if (bottom) this.borderBottom = bottom;
    if (left) this.borderLeft = left;
  }

  innerWidth() {
    return this.width - this.padding * 2 - 2;
  }

  innerHeight() {
    return this.height - this.padding * 2 - 2;
  }

  textx(align) {
    const { width, padding } = this;
    let { x } = this;
    if (align === 'left') {
      x += padding;
    } else if (align === 'center') {
      x += width / 2;
    } else if (align === 'right') {
      x += width - padding;
    }
    return x;
  }

  texty(align, h) {
    const { height, padding } = this;
    let { y } = this;
    if (align === 'top') {
      y += padding;
    } else if (align === 'middle') {
      y += height / 2 - h / 2;
    } else if (align === 'bottom') {
      y += height - padding - h;
    }
    return y;
  }

  topxys() {
    const { x, y, width } = this;
    return [
      [x, y],
      [x + width, y],
    ];
  }

  rightxys() {
    const { x, y, width, height } = this;
    return [
      [x + width, y],
      [x + width, y + height],
    ];
  }

  bottomxys() {
    const { x, y, width, height } = this;
    return [
      [x, y + height],
      [x + width, y + height],
    ];
  }

  leftxys() {
    const { x, y, height } = this;
    return [
      [x, y],
      [x, y + height],
    ];
  }
}

function drawFontLine(type, tx, ty, align, valign, blheight, blwidth) {
  const floffset = { x: 0, y: 0 };
  if (type === 'underline') {
    if (valign === 'bottom') {
      floffset.y = 0;
    } else if (valign === 'top') {
      floffset.y = -(blheight + 2);
    } else {
      floffset.y = -blheight / 2;
    }
  } else if (type === 'strike') {
    if (valign === 'bottom') {
      floffset.y = blheight / 2;
    } else if (valign === 'top') {
      floffset.y = -(blheight / 2 + 2);
    }
  }

  if (align === 'center') {
    floffset.x = blwidth / 2;
  } else if (align === 'right') {
    floffset.x = blwidth;
  }
  this.line([tx - floffset.x, ty - floffset.y], [tx - floffset.x + blwidth, ty - floffset.y]);
}

class Draw {
  constructor(el, width, height) {
    this.el = el;
    this.ctx = el.getContext('2d');
    this.resize(width, height);
    this.ctx.scale(dpr(), dpr());
  }

  resize(width, height) {
    // console.log('dpr:', dpr);
    this.el.style.width = `${width}px`;
    this.el.style.height = `${height}px`;
    this.el.width = npx(width);
    this.el.height = npx(height);
  }

  clear() {
    const { width, height } = this.el;
    this.ctx.clearRect(0, 0, width, height);
    return this;
  }

  attr(options) {
    Object.assign(this.ctx, options);
    return this;
  }

  save() {
    this.ctx.save();
    this.ctx.beginPath();
    return this;
  }

  restore() {
    this.ctx.restore();
    return this;
  }

  beginPath() {
    this.ctx.beginPath();
    return this;
  }

  translate(x, y) {
    this.ctx.translate(npx(x), npx(y));
    return this;
  }

  scale(x, y) {
    this.ctx.scale(x, y);
    return this;
  }

  clearRect(x, y, w, h) {
    this.ctx.clearRect(x, y, w, h);
    return this;
  }

  fillRect(x, y, w, h) {
    this.ctx.fillRect(npx(x) - 0.5, npx(y) - 0.5, npx(w), npx(h));
    return this;
  }

  fillText(text, x, y) {
    this.ctx.fillText(text, npx(x), npx(y));
    return this;
  }

  /**
   * ��ͼƬ��
   * @param {*} box - һ�� DrawBox ����
   * @param {string} src - ͼƬ��·��
   * @param {Object} fixedIndexWidth - ���������
   * @param {Object} fixedIndexHeight - ������߶�
   */
  fillImage(box, { value: src }, { fixedIndexWidth, fixedIndexHeight }, scroll, celldata) {
    if (!celldata.imagewidth) {
      return;
    }
    if (celldata.value == '' || celldata.value == undefined) {
      imageMap.forEach((value, key) => {
        if (value[0] === celldata.scaledWidth && value[1] === celldata.scaledHeight) {
          imageMap.delete(key);
        }
      });
    }
    const imageTop = celldata.top;
    const imageLeft = celldata.left;
    const { x, y, width, height } = box;
    // if(!((imageTop  ==y &&  imageLeft == x) || (imageTop  ==y-scroll.scroll.y &&  imageLeft == x-scroll.scroll.x)))
    // {return}
    const img = new Image();
    img.src = src;
    img.onload = () => {
      this.ctx.save();
      // �������Ͻ�λ�ã�Ϊʲôtranslateû����Ч�أ���Ϊ�첽����
      let sx = x + fixedIndexWidth;
      let sy = y + fixedIndexHeight;
      if (scroll) {
        sx = sx - scroll.scroll.x + 0;
        sy = sy - scroll.scroll.y + 0;
      }
      //���㳤����
      const imageWidth = celldata.imagewidth;
      const imageHeight = celldata.imageheight;
      const imageH = height - 2; // ������ʵ�ʿ��߱ȣ�ֱ��������Ԫ��
      const gridCellWidth = width;
      const gridCellHeight = height;
      let widthRatio = gridCellWidth / imageWidth;
      let heightRatio = gridCellHeight / imageHeight;
      let scaleRatio = Math.min(widthRatio, heightRatio);
      let scaledWidth = imageWidth * scaleRatio;
      let scaledHeight = imageHeight * scaleRatio;
      if (imageMap.has(img.src)) {
        // scaledWidth = imageMap.get(img.src)[0]
        // scaledHeight = imageMap.get(img.src)[1]
        // celldata.scaledWidth = scaledWidth
        // celldata.scaledHeight = scaledHeight
        // celldata.scaleRatio = scaleRatio

        //����ͼƬʱ�Ѵ���ƫ��
        if (imageMap.get(img.src)[2] != 0 || imageMap.get(img.src)[3] != 0) {
          //���¼����ʼλ��
          // if (scroll.scroll.x > imageMap.get(img.src)[2]) {
          //   sx = sx + (scroll.scroll.x - imageMap.get(img.src)[2])
          // } else {
          //   sx = sx - (imageMap.get(img.src)[2] - scroll.scroll.x)
          // }
          // if (scroll.scroll.y > imageMap.get(img.src)[3]) {
          //   sy = sy + (scroll.scroll.y - imageMap.get(img.src)[3])
          // } else {
          //   sy = sy - (imageMap.get(img.src)[3] - scroll.scroll.y)
          // }
          // sx = sx - (scroll.scroll.x - imageMap.get(img.src)[2]) - 5
          // sy = sy - (scroll.scroll.y - imageMap.get(img.src)[3]) - 5
          // ��ֹ�ظ���Ⱦ
          if (imageTop == y - scroll.scroll.y && imageLeft == x - scroll.scroll.x) {
            this.ctx.drawImage(img, npx(sx), npx(sy), npx(imageWidth), npx(imageH));
            this.ctx.restore();
          }
        } else {
          // if (imageTop == y && imageLeft == x) {
          this.ctx.drawImage(img, npx(sx), npx(sy), npx(imageWidth), npx(imageH));
          this.ctx.restore();
          // }
        }
      } else {
        // imageMap.set(img.src, [scaledWidth, scaledHeight, scroll.scroll.x, scroll.scroll.y])
        // celldata.scaledWidth = scaledWidth
        // celldata.scaledHeight = scaledHeight
        // celldata.scaleRatio = scaleRatio
        // if (imageTop == y - scroll.scroll.y && imageLeft == x - scroll.scroll.x) {
        this.ctx.drawImage(img, npx(sx), npx(sy), npx(imageWidth), npx(imageH));
        this.ctx.restore();
        // }
      }
    };
    return this;
  }

  /**
   * ����ͼ�Ρ�
   * �����ﱾ�����ο�text�������߼�������Ԫ��Ϊ radio, checkbox, date ʱ��������ǰ������Ӧ��ͼ�Ρ�
   * @param {Object} cell - ��Ԫ��
   * @param {Object} box - DrawBox
   * @param {Object} fixedIndexWidth - ���������
   * @param {Object} fixedIndexHeight - ������߶�
   * @returns {Draw} CanvasRenderingContext2D ʵ��
   */
  async geometry(cell, box, { fixedIndexWidth, fixedIndexHeight }, style, scroll, celldata) {
    const { type } = cell;
    switch (type) {
      case 'image':
        await this.fillImage(box, cell, { fixedIndexWidth, fixedIndexHeight }, scroll, celldata);
        break;
      default:
    }

    return this;
  }

  /*
    txt: render text
    box: DrawBox
    attr: {
      align: left | center | right
      valign: top | middle | bottom
      color: '#333333',
      strike: false,
      font: {
        name: 'Arial',
        size: 14,
        bold: false,
        italic: false,
      }
    }
    textWrap: text wrapping
  */
  text(mtxt, box, attr = {}, textWrap = true) {
    const { ctx } = this;
    const { align, valign, font, color, strike, underline } = attr;
    const tx = box.textx(align);
    ctx.save();
    ctx.beginPath();
    this.attr({
      textAlign: align,
      textBaseline: valign,
      font: `${font.italic ? 'italic' : ''} ${font.bold ? 'bold' : ''} ${npx(font.size)}px ${
        font.name
      }`,
      fillStyle: color,
      strokeStyle: color,
    });
    const txts = `${mtxt}`.split('\n');
    const biw = box.innerWidth();
    const ntxts = [];
    txts.forEach(it => {
      const txtWidth = ctx.measureText(it).width;
      if (textWrap && txtWidth > npx(biw)) {
        let textLine = { w: 0, len: 0, start: 0 };
        for (let i = 0; i < it.length; i += 1) {
          if (textLine.w >= npx(biw)) {
            ntxts.push(it.substr(textLine.start, textLine.len));
            textLine = { w: 0, len: 0, start: i };
          }
          textLine.len += 1;
          textLine.w += ctx.measureText(it[i]).width + 1;
        }
        if (textLine.len > 0) {
          ntxts.push(it.substr(textLine.start, textLine.len));
        }
      } else {
        ntxts.push(it);
      }
    });
    const txtHeight = (ntxts.length - 1) * (font.size + 2);
    let ty = box.texty(valign, txtHeight);
    ntxts.forEach(txt => {
      const txtWidth = ctx.measureText(txt).width;
      this.fillText(txt, tx, ty);
      if (strike) {
        drawFontLine.call(this, 'strike', tx, ty, align, valign, font.size, txtWidth);
      }
      if (underline) {
        drawFontLine.call(this, 'underline', tx, ty, align, valign, font.size, txtWidth);
      }
      ty += font.size + 2;
    });
    ctx.restore();
    return this;
  }

  border(style, color) {
    const { ctx } = this;
    ctx.lineWidth = thinLineWidth;
    ctx.strokeStyle = color;
    // console.log('style:', style);
    if (style === 'medium') {
      ctx.lineWidth = npx(2) - 0.5;
    } else if (style === 'thick') {
      ctx.lineWidth = npx(3);
    } else if (style === 'dashed') {
      ctx.setLineDash([npx(3), npx(2)]);
    } else if (style === 'dotted') {
      ctx.setLineDash([npx(1), npx(1)]);
    } else if (style === 'double') {
      ctx.setLineDash([npx(2), 0]);
    }
    return this;
  }

  line(...xys) {
    const { ctx } = this;
    if (xys.length > 1) {
      ctx.beginPath();
      const [x, y] = xys[0];
      ctx.moveTo(npxLine(x), npxLine(y));
      for (let i = 1; i < xys.length; i += 1) {
        const [x1, y1] = xys[i];
        ctx.lineTo(npxLine(x1), npxLine(y1));
      }
      ctx.stroke();
    }
    return this;
  }

  strokeBorders(box) {
    const { ctx } = this;
    ctx.save();
    // border
    const { borderTop, borderRight, borderBottom, borderLeft } = box;
    if (borderTop) {
      this.border(...borderTop);
      // console.log('box.topxys:', box.topxys());
      this.line(...box.topxys());
    }
    if (borderRight) {
      this.border(...borderRight);
      this.line(...box.rightxys());
    }
    if (borderBottom) {
      this.border(...borderBottom);
      this.line(...box.bottomxys());
    }
    if (borderLeft) {
      this.border(...borderLeft);
      this.line(...box.leftxys());
    }
    ctx.restore();
  }

  dropdown(box) {
    const { ctx } = this;
    const { x, y, width, height } = box;
    const sx = x + width - 15;
    const sy = y + height - 15;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(sx), npx(sy));
    ctx.lineTo(npx(sx + 8), npx(sy));
    ctx.lineTo(npx(sx + 4), npx(sy + 6));
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, .45)';
    ctx.fill();
    ctx.restore();
  }

  error(box) {
    const { ctx } = this;
    const { x, y, width } = box;
    const sx = x + width - 1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(sx - 8), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y + 8));
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 0, 0, .65)';
    ctx.fill();
    ctx.restore();
  }

  frozen(box) {
    const { ctx } = this;
    const { x, y, width } = box;
    const sx = x + width - 1;
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(npx(sx - 8), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y - 1));
    ctx.lineTo(npx(sx), npx(y + 8));
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 255, 0, .85)';
    ctx.fill();
    ctx.restore();
  }

  rect(box, dtextcb) {
    const { ctx } = this;
    const { x, y, width, height, bgcolor } = box;
    ctx.save();
    ctx.beginPath();
    ctx.fillStyle = bgcolor || '#fff';
    ctx.rect(npxLine(x + 1), npxLine(y + 1), npx(width - 2), npx(height - 2));
    ctx.clip();
    ctx.fill();
    dtextcb();
    ctx.restore();
  }
}

export default {};
export { Draw, DrawBox, thinLineWidth, npx };
