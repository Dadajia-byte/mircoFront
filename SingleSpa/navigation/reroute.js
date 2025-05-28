import { getAppChanges } from "../application/app.helpers.js";

export const reroute = () => {
  const { appsToLoad, appsToUnmount, appsToMount } = getAppChanges();
  console.log(appsToLoad, appsToUnmount, appsToMount);
  appsToLoad.map(app => toLoadPromise)
}