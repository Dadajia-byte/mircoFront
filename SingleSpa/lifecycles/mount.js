import { MOUNTED, NOT_MOUNTED, UNMOUNTING } from "../application/app.helpers";

export const toMountPromise = (app) => {
  return Promise.resolve().then(() => {
    if (app.status !== NOT_MOUNTED) {
      return app;
    }
    return app.unmount(app.customProps).then(() => {
      app.status = MOUNTED;
    });
  }); 
}