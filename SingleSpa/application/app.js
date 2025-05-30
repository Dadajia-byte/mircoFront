import { reroute } from "../navigation/reroute.js";
import { NOT_LOADED } from "./app.helpers.js";

export const apps = [];
export function registerApplication(appName, loadApp, activeWhen, customProps) {
  const registerApplication = {
    name: appName,
    loadApp,
    activeWhen,
    customProps,
    status: NOT_LOADED, // 应用尚未被加载
    windowSnapshot: null, // 应用的window快照
  }
  apps.push(registerApplication);
  // 未加载 -》 加载 -》 挂载 -》 启动
  reroute(); // 重写路由
}