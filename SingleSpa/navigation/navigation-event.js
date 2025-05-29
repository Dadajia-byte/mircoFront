// 对于用户的路径切换 进行劫持，劫持后重新调用reroute方法，进行计算应用的加载

import { reroute } from "./reroute.js";

function urlRoute() {
  reroute();
}

window.addEventListener('hashchange', urlRoute);

window.addEventListener('popstate', urlRoute); // 浏览器历史切换
