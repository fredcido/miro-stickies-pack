import type { StickyNote, CustomEvent } from "@mirohq/websdk-types";
import { getReferenceItem, createPack } from "./pack";

const PANEL_HEIGHT = 560;

async function init() {
  miro.board.ui.on("icon:click", async () => {
    await miro.board.ui.openPanel({ url: "app.html", height: PANEL_HEIGHT });
  });

  miro.board.ui.on("custom:create-pack", ({ items }: CustomEvent) => {
    const referenceItem = getReferenceItem(items) as StickyNote;
    createPack({ referenceItem });
  });

  miro.board.ui.on("custom:open-settings", async () => {
    await miro.board.ui.openPanel({ url: "app.html", height: PANEL_HEIGHT });
  });
}

init();
