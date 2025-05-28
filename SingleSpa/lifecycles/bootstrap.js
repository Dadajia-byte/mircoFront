import { BOOTSTRAPPING, NOT_BOOTSTRAPPED, NOT_MOUNTED } from "../application/app.helpers"

export const toBootstrapPromise = (app) => {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_BOOTSTRAPPED) {
      // 如果应用已经被启动过了
      return app;
    }
    app.status = BOOTSTRAPPING;
    return app.bootstrap(app.customProps).then(() => {
      app.status = NOT_MOUNTED;
      return app;
    });
  })
}