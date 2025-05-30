// 对于用户的路径切换 进行劫持，劫持后重新调用reroute方法，进行计算应用的加载

import { reroute } from "./reroute.js";

function urlRoute() {
  reroute(arguments);
}

window.addEventListener('hashchange', urlRoute);

window.addEventListener('popstate', urlRoute); // 浏览器历史切换

// 但是路由切换时，我们触发single-spa的addEventListener，应用当中可能也会存在addEventListener
// 所以应用中对路由的监听，我们必须让他在新应用挂载完毕后，再进行监听；因此需要劫持原生的路由系统

const captureEventListener = {
  hashchange: [],
  popstate: [],
};
const listeningTo = ['hashchange', 'popstate'];
const originalAddEventListener = window.addEventListener;
const originalRemoveEventListener = window.removeEventListener;
window.addEventListener = function(eventName, cb) {
  // 有要监听的事件，函数不能重复
  if (listeningTo.includes(eventName) && captureEventListener[eventName].some(fn => fn === cb)) {
    return captureEventListener[eventName].push(cb);
  }
  return originalAddEventListener.apply(this, arguments);
}
window.removeEventListener = function(eventName, cb) {
  // 有要监听的事件，函数不能重复
  if (listeningTo.includes(eventName)) {
    captureEventListener[eventName] = captureEventListener[eventName].filter(fn => fn !== cb);
    return;
  }
  return originalRemoveEventListener.apply(this, arguments);
}

export function callCaptureEventListener(e) {
  if (e) { // 如果有事件对象，说明是路由切换
    const eventName = e[0].type;
    if (listeningTo.includes(eventName)) {
      captureEventListener[eventName].forEach(fn => fn.apply(this, e));
    }
  }
}

function patchFn(updateState, methodName) {
  return function() {
    const urlBefore = window.location.href;
    const r = updateState.apply(this, arguments); // 调用此方法确实发生了路由切换
    const urlAfter = window.location.href;
    if (urlBefore !== urlAfter) {
      window.dispatchEvent(new PopStateEvent("popstate")); // 手动触发popstate事件
    }
    return r;
  }
}

window.history.pushState = patchFn(window.history.pushState, 'pushState');
window.history.replaceState = patchFn(window.history.replaceState, 'replaceState');