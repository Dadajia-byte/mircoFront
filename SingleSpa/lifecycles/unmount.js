import { MOUNTED, NOT_MOUNTED, UNMOUNTING } from "../application/app.helpers.js";

export const toUnmountPromise = (app) => {
  return Promise.resolve().then(() => {
    if (app.status !== MOUNTED) {
      return app;
    }
    app.status = UNMOUNTING; // 应用正在卸载
    return app.unmount(app.customProps).then(() => {
      app.status = NOT_MOUNTED; // 应用卸载完毕
    });
  }); 
}