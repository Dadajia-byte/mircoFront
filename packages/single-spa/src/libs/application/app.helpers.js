import { apps } from "./app.js";

// 加载
export const NOT_LOADED = "NOT_LOADED"; // 应用尚未被加载
export const LOADING_SOURCE_CODE = "LOADING_SOURCE_CODE"; // 路径匹配成功，正在加载应用源码
export const LOAD_ERROR = "LOAD_ERROR"; // 应用加载失败

// 启动
export const NOT_BOOTSTRAPPED = "NOT_BOOTSTRAPPED"; // 应用源码加载成功，尚未启动
export const BOOTSTRAPPING = "BOOTSTRAPPING"; // 应用正在启动
export const NOT_MOUNTED = "NOT_MOUNTED"; // 应用启动成功，尚未挂载

// 挂载
export const MOUNTING = "MOUNTING"; // 应用正在挂载
export const MOUNTED = "MOUNTED"; // 应用已挂载

// 卸载
export const UNMOUNTING = "UNMOUNTING"; // 应用正在卸载
export const UNLOADING = "UNLOADING"; // 移除加载

export const isActive = (app) => {
  return app.status === MOUNTED;
}

export const shouldBeActive = (app) => {
  return app.activeWhen(window.location)
}

export const getAppChanges = () => {
  const appsToLoad = [];
  const appsToUnmount = [];
  const appsToMount = [];

  apps.forEach(app => {
    let appShouldBeActive = shouldBeActive(app);
    switch (app.status) {
      case NOT_LOADED:
      case LOADING_SOURCE_CODE:
        // 1. 当前路径下哪些应用要被加载
        if (appShouldBeActive) {
          appsToLoad.push(app);
        }
        break;
      case NOT_BOOTSTRAPPED:
      case BOOTSTRAPPING:
      case NOT_MOUNTED:
        // 2. 当前路径下哪些应用要被挂载
        if (appShouldBeActive) {
          appsToMount.push(app);
        }
        break;
      case MOUNTED:
        // 3. 当前路径下哪些应用要被激活
        if (!appShouldBeActive) {
          appsToUnmount.push(app);
        }
        break;
      default:
        break;
    }
  });

  return {
    appsToLoad,
    appsToUnmount,
    appsToMount
  };
}