export class LegacySandbox {
  modifyPropsMap: Map<any, any>;
  addedProps: Map<any, any>;
  currentPropsMap: Map<any, any>;
  proxy: any;
  constructor() {
    this.modifyPropsMap = new Map();
    this.addedProps = new Map();
    this.currentPropsMap = new Map();

    const fakeWindow = Object.create(null);
    const proxy = new Proxy(fakeWindow, {
      get: (_, key) => {
        return window[key]
      },
      set: (_, key, value: any) => {
        if (!Object.prototype.hasOwnProperty.call(window, key)) {
          // 添加的属性
          this.addedProps.set(key, value);
        } else if (!this.modifyPropsMap.has(key)) {
          // 保存修改前的原值
          this.modifyPropsMap.set(key, window[key]);
        }
        // 所有更新后的属性值
        this.currentPropsMap.set(key, value);
        window[key] = value;
        return true;
      },
    });
    this.proxy = proxy;
  }

  setWindowProp(key: string, value: any) {
    if (value === undefined) {
      delete window[key];
    } else {
      window[key] = value;
    }
  }
  active() {
    this.currentPropsMap.forEach((value, key) => {
      this.setWindowProp(key, value);
    });
  }
  inactive() {
    // 恢复修改的属性
    this.modifyPropsMap.forEach((value, key) => {
      this.setWindowProp(key, value);
    });
    // 删除添加的属性
    this.addedProps.forEach((_, key) => {
      this.setWindowProp(key, undefined);
    });
  }
}

const sandbox = new LegacySandbox();
// 直接操作window，仅支持单应用
(function(window) {
})(sandbox); // 使用sandbox作为window对象实现隔离