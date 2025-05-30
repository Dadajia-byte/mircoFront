import { getAppChanges, shouldBeActive } from "../application/app.helpers.js";
import { toBootstrapPromise } from "../lifecycles/bootstrap.js";
import { toLoadPromise } from "../lifecycles/load.js";
import { toMountPromise } from "../lifecycles/mount.js";
import { toUnmountPromise } from "../lifecycles/unmount.js";
import { started } from "../start.js";
import { callCaptureEventListener } from "./navigation-event.js";

let appChangeUnderWay = false;
let peopleWaitingOnAppChange = [];

export const reroute = (event) => {
  const { appsToLoad, appsToUnmount, appsToMount } = getAppChanges();

  // 如果多次触发reroute方法，我们可以创建一个队列来屏蔽这个问题
  if (appChangeUnderWay) {
    return new Promise((resolve, reject)=>{
      peopleWaitingOnAppChange.push({
        resolve,
        reject,
      });
    })
  }

  // 加载完毕后 需要去挂载应用

  // 先拿到应用加载 -》 
  if (started) {
    // 用户调用过start方法 我们需要处理当前应用挂载或者卸载
    appChangeUnderWay = true;
    return performAppChange()
  }


  return loadApps();

  function loadApps() {
    return Promise.all(appsToLoad.map(toLoadPromise)).then(callEventListeners);
  }
  function performAppChange() {
    // 将不需要的应用卸载掉
    // 加载需要的应用 -》 启动对应的应用 -》卸载之前的应用 -》 挂载对应的应用
    // 1. 卸载应用
    const unmountPromise = Promise.all(appsToUnmount.map(toUnmountPromise));
    // 2. 加载应用(可能这个应用在注册的时候就已经被加载了)
    const loadMountPromise = Promise.all(appsToLoad.map(app=>toLoadPromise(app).then(app=>{
      // 当应用加载完毕后，需要启动和挂载，但是要保证挂载前，先卸载应用
      return tryBootstrapAndMount(app, unmountPromise);
    })));
    // 如果应用没有加载过 加载-》启动-》挂载； 如果应用加载过了 挂载
    const mountPromise = Promise.all(appsToMount.map(app=>tryBootstrapAndMount(app, unmountPromise)));

    function tryBootstrapAndMount(app, unmountPromise) {
      if(shouldBeActive(app)) {
        // 保证卸载完毕再挂载
        return toBootstrapPromise(app).then(app=>unmountPromise.then(()=>toMountPromise(app)))
      }
    }
    
    return Promise.all([loadMountPromise, mountPromise]).then(()=>{
      callEventListeners();
      appChangeUnderWay = false;
      if (peopleWaitingOnAppChange.length > 0) {
        // 如果有等待的队列，说明之前有reroute方法被调用
        peopleWaitingOnAppChange.forEach(({ resolve }) => resolve());
        peopleWaitingOnAppChange = [];
      }
    });
  }

  function callEventListeners() {
    callCaptureEventListener(event)
  }


}