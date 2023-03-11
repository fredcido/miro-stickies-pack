import type { StickyNote, CustomEvent } from "@mirohq/websdk-types";
import { getReferenceItem, createPack, getConfig } from "./pack";

async function init() {
  miro.board.ui.on("custom:create-pack", async ({ items }: CustomEvent) => {
    const referenceItem = getReferenceItem(items) as StickyNote;
    const config = await getConfig();
    createPack({ referenceItem, config });
  });

  let openingPanel: ReturnType<typeof setTimeout> | undefined;
  miro.board.ui.on("icon:click", async () => {
    if (openingPanel) {
      clearTimeout(openingPanel);

      const items = await miro.board.getSelection();
      const referenceItem = getReferenceItem(items) as StickyNote;

      const config = await getConfig();
      createPack({ referenceItem, config });

      openingPanel = undefined;
    } else {
      openingPanel = setTimeout(async () => {
        if (openingPanel) {
          await miro.board.ui.openPanel({ url: "app.html" });
        }

        openingPanel = undefined;
      }, 50);
    }
  });
}

init();
