import { MOUNTED, NOT_MOUNTED, UNMOUNTING } from "../application/app.helpers.js";

export const toMountPromise = (app) => {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_MOUNTED) {
      return app;
    }
    return app.mount(app.customProps).then(() => {
      app.status = MOUNTED;
      return app
    });
  }); 
}