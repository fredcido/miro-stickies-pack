import type { StickyNote, CustomEvent } from "@mirohq/websdk-types";
import { getReferenceItem, createPack, getConfig } from "./pack";

async function init() {
  miro.board.ui.on("icon:click", async () => {
    await miro.board.ui.openPanel({ url: "app.html" });
  });

  miro.board.ui.on("custom:create-pack", async ({ items }: CustomEvent) => {
    const referenceItem = getReferenceItem(items) as StickyNote;
    const config = await getConfig();
    createPack({ referenceItem, config });
  });

  miro.board.ui.on("custom:open-settings", async () => {
    await miro.board.ui.openPanel({ url: "app.html" });
  });
}

init();
