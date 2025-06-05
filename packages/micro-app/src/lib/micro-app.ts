import { defineElement } from "./micro-app-element";

interface MicroAppOptions {
  tagName?: string;   // 自定义元素标签名
}

class MicroApp {
  private tagName: string;

  constructor() {
    this.tagName = 'micro-app';  // 默认标签名
  }

  // 只负责注册自定义元素
  start(options: MicroAppOptions = {}) {
    this.tagName = options.tagName || 'micro-app';
    defineElement(this.tagName);
    return this;
  }
}

export default new MicroApp();