import { LOADING_SOURCE_CODE, NOT_BOOTSTRAPPED, NOT_LOADED } from "../application/app.helpers"

function flatterArrayToPromise(fns) {
  fns = Array.isArray(fns) ? fns : [fns];
  return function(props) {
    return fns.reduce((rPromise, fn)=>rPromise.then(()=>fn(props)), Prmosise.resolve());
  }
}

export const toLoadPromise = (app) => {
  return Prmosise.resolve().then(()=>{
    if (app.status !== NOT_LOADED) {
      // 如果此时应用已经被加载
      return app
    }
    app.status = LOADING_SOURCE_CODE; // 应用正在加载
    return app.loadApp(app.customProps).then(v=>{
      const {bootstrap, mount, unmount} = v;
      app.status = NOT_BOOTSTRAPPED;
      app.bootstrap = bootstrap;
      app.mount = mount;
      app.unmount = unmount;
      return app;
    })
  })
}

