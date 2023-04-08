import type { StickyNote, CustomEvent } from "@mirohq/websdk-types";
import { getReferenceItem, createPack } from "./pack";
import { track, Event } from "./analytics";

const PANEL_HEIGHT = 560;

async function init() {
  track(Event.PAGE_LOAD, { page: "index" });
  miro.board.ui.on("icon:click", async () => {
    track(Event.ICON_CLICK);
    await miro.board.ui.openPanel({ url: "app.html", height: PANEL_HEIGHT });
  });

  miro.board.ui.on("custom:create-pack", ({ items }: CustomEvent) => {
    track(Event.CUSTOM_ACTON, { action: "create-pack" });
    const referenceItem = getReferenceItem(items) as StickyNote;
    createPack({ referenceItem, source: "custom_action" });
  });

  miro.board.ui.on("custom:open-settings", async () => {
    track(Event.CUSTOM_ACTON, { action: "open-settings" });
    await miro.board.ui.openPanel({ url: "app.html", height: PANEL_HEIGHT });
  });
}

init();
