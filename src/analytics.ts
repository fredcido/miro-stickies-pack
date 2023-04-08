import mixpanel from "mixpanel-browser";
import type { Dict } from "mixpanel-browser";
import { v4 as uuidv4 } from "uuid";

mixpanel.init("f0b9cc05dad833d3d22300f595482a73");
mixpanel.identify(uuidv4());

export enum Event {
  PAGE_LOAD = "page_load",
  CUSTOM_ACTON = "custom_action",
  PROPERTY_CHANGED = "property_changed",
  SETTING_SAVED = "setting_saved",
  ICON_CLICK = "icon_click",
  PACKS_CREATED = "packs_created",
  TAB_CHANGED = "tab_changed",
}

export function track(event: Event, payload?: Dict) {
  mixpanel.track(event, payload);
}

export function isTracking(): boolean {
  const optOut = mixpanel.has_opted_out_tracking();
  return !optOut;
}

export function enableTracking(): void {
  mixpanel.opt_in_tracking();
}

export function disbleTracking(): void {
  mixpanel.opt_out_tracking();
}
