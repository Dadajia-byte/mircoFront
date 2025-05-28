import { reroute } from "./navigation/reroute";

export let started = false;
export const start=() =>{
  started = true;
  reroute()
}