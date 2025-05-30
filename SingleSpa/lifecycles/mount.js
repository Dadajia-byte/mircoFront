import { MOUNTED, NOT_MOUNTED } from "../application/app.helpers.js";
import { getWindowSnapshot } from "../application/sandbox.js";

export const toMountPromise = (app) => {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_MOUNTED) {
      return app;
    }
    app.windowSnapshot = getWindowSnapshot(); // 在挂载前获取记录快照
    return app.mount(app.customProps).then(() => {
      app.status = MOUNTED;
      return app
    });
  }); 
}