import { defineElement } from "./micro-app-element";

interface MicroAppOptions {
  tagName?: string;   // 自定义元素标签名
  apps?: Array<{
    name: string;     // 应用名称
    url: string;      // 应用入口 URL
    container: string; // 应用容器选择器
  }>;
}

class MicroApp {
  private options: MicroAppOptions;
  private tagName: string;
  constructor() {
    this.options = {};
    this.tagName = 'micro-app';  // 默认标签名
  }
  start(options: MicroAppOptions = {}) {
    this.options = options;
    this.tagName = options.tagName || 'micro-app';

    // 注册自定义元素
    defineElement(this.tagName);

    // 如果提供了 apps 配置，自动创建容器和加载应用
    if (options.apps?.length) {
      this.mountApps(options.apps);
    }

    return this;
  }

  // 挂载应用列表
  private mountApps(apps: MicroAppOptions['apps'] = []) {
    apps.forEach(app => {
      const container = document.querySelector(app.container);
      if (!container) {
        console.error(`[MicroApp] Container not found: ${app.container}`);
        return;
      }

      // 创建微应用容器元素
      const microAppElement = document.createElement(this.tagName);
      microAppElement.setAttribute('name', app.name);
      microAppElement.setAttribute('url', app.url);

      // 清空容器并挂载微应用
      container.innerHTML = '';
      container.appendChild(microAppElement);
    });
  }

  // 手动加载单个应用
  loadApp(name: string, url: string, container: string | HTMLElement) {
    const containerElement = typeof container === 'string' 
      ? document.querySelector(container)
      : container;

    if (!containerElement) {
      console.error('[MicroApp] Container not found');
      return;
    }

    const microAppElement = document.createElement(this.tagName);
    microAppElement.setAttribute('name', name);
    microAppElement.setAttribute('url', url);

    containerElement.innerHTML = '';
    containerElement.appendChild(microAppElement);
  }
}

export default new MicroApp();