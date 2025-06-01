export class SnapshotSandbox {
  modifyPropsMap;
  windowSnapshot;
  constructor() {
    this.modifyPropsMap = {};
  }
  active() {
    this.windowSnapshot = {};
    Object.keys(window).forEach(prop=> {
      this.windowSnapshot[prop] = window[prop];
    });
  }
  inactive() {
    this.modifyPropsMap = {};
    Object.keys(window).forEach(prop=> {
      if (window[prop]!==this.windowSnapshot[prop]) {
        this.modifyPropsMap[prop] = window[prop];
      }
   });
  }
}

const sandbox = new SnapshotSandbox();
// 直接操作window，仅支持单应用
(function(window) {
})(sandbox); // 使用sandbox作为window对象实现隔离