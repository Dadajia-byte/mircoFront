import { getAppChanges, shouldBeActive } from "../application/app.helpers.js";
import { toBootstrapPromise } from "../lifecycles/bootstrap.js";
import { toLoadPromise } from "../lifecycles/load.js";
import { toMountPromise } from "../lifecycles/mount.js";
import { toUnmountPromise } from "../lifecycles/unmount.js";
import { started } from "../start.js";
import './navigation-event.js'

export const reroute = () => {
  const { appsToLoad, appsToUnmount, appsToMount } = getAppChanges();
  
  // 加载完毕后 需要去挂载应用

  // 先拿到应用加载 -》 
  if (started) {
    // 用户调用过start方法 我们需要处理当前应用挂载或者卸载
    return performAppChange()
  }


  return loadApps();

  function loadApps() {
    return Promise.all(appsToLoad.map(toLoadPromise));
  }
  function performAppChange() {
    // 将不需要的应用卸载掉
    // 加载需要的应用 -》 启动对应的应用 -》 挂载对应的应用
    // 1. 卸载应用
    const unmountPromise = Promise.all(appsToUnmount.map(toUnmountPromise));
    // 2. 加载应用(可能这个应用在注册的时候就已经被加载了)
    const mountPromise = Promise.all(appsToLoad.map(app=>toLoadPromise(app).then(app=>{
      // 当应用加载完毕后，需要启动和挂载，但是要保证挂载前，先卸载应用
      return tryBootstrapAndMount(app, unmountPromise);
    })));
    function tryBootstrapAndMount(app, unmountPromise) {
      if(shouldBeActive(app)) {
        // 保证卸载完毕再挂载
        return toBootstrapPromise(app).then(app=>unmountPromise.then(()=>toMountPromise(app)))
      }
    }
  }
}