export class ProxySandbox {
  proxy: any;
  running: boolean;
  constructor() {
    this.running = false;
    const fakeWindow = Object.create(null);
    this.proxy = new Proxy(fakeWindow, {
      get: (target, key) => {
        return key in target ? target[key] : window[key];
      },
      set: (target, key, value) => {
        this.running && (target[key] = value);
        return true;
      },
    });
  }
  active() {
    if (!this.running) this.running = true;
  }
  inactive() {
    this.running = false;
  }
}

const sandbox1 = new ProxySandbox();
const sandbox2 = new ProxySandbox();

(function(window) {
})(sandbox1.proxy); // 使用sandbox1.proxy作为window对象实现隔离

// 支持多应用
(function(window) {
})(sandbox2.proxy);