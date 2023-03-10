import type { StickyNote, Item, Rect } from "@mirohq/websdk-types";
import { StickyNoteColor } from "@mirohq/websdk-types";

export type PackConfig = {
  columns: number;
  packs: number;
  stickies: number;
  stickyOffset: number;
  stickyGap: number;
  zoomTo: boolean;
  selectItems: boolean;
  colors: StickyNoteColor[];
};

export const defaultConfig: PackConfig = {
  columns: 3,
  packs: 6,
  stickies: 5,
  stickyOffset: 20,
  stickyGap: 20,
  zoomTo: true,
  selectItems: true,
  colors: Object.values(StickyNoteColor),
} as const;

type CreatePackOpts = {
  config?: typeof defaultConfig;
  referenceItem?: StickyNote;
};

function filterSupportedItems(items: Item[]): Rect[] {
  return items.filter(
    (item) =>
      Object.hasOwn(item, "x") &&
      Object.hasOwn(item, "y") &&
      Object.hasOwn(item, "width") &&
      Object.hasOwn(item, "height")
  ) as Rect[];
}

export async function saveConfig(config: PackConfig) {
  await miro.board.setAppData("config", config);
}

export async function getConfig() {
  const { config } = await miro.board.getAppData();
  if (config) {
    return config as PackConfig;
  }
}

export function getReferenceItem(items: Item[]) {
  const supportedItems = filterSupportedItems(items);

  supportedItems.sort((a, b) => {
    if (a.y < b.y) {
      return -1;
    } else if (a.y > b.y) {
      return 1;
    }
    return b.x - a.x;
  });

  const referenceItem = supportedItems.at(0);

  return referenceItem;
}

export async function getDefaultValues() {
  const items = await miro.board.getSelection();
  const referenceItem = getReferenceItem(items);

  if (referenceItem) {
    return {
      ...referenceItem,
      // @ts-expect-error
      shape: referenceItem.shape || "square",
    };
  }

  const viewport = await miro.board.viewport.get();

  const values = {
    width: 200,
    height: 200,
    x: viewport.x + viewport.width / 2,
    y: viewport.y + viewport.height / 2,
    shape: "square",
  } as const;

  return values;
}

export async function createPack(opts: CreatePackOpts = {}) {
  const { config = defaultConfig, referenceItem } = opts;
  const reference = referenceItem ?? (await getDefaultValues());

  const startPosition = config.stickyGap + reference.x + reference.width;
  const gap = config.stickyGap + config.stickies * config.stickyOffset;

  const marginLeft = reference.width + gap;
  let packYPosition = reference.y;
  let packXPosition = startPosition + marginLeft;

  const waitFor: Promise<StickyNote>[] = [];
  for (let packPos = 0; packPos < config.packs; packPos++) {
    packXPosition =
      startPosition + marginLeft * Math.floor(packPos % config.columns);

    if (packPos > 0 && packPos % config.columns === 0) {
      packYPosition = packYPosition + (reference.height + gap);
    }

    for (let stickyPos = 0; stickyPos < config.stickies; stickyPos++) {
      const x = packXPosition + config.stickyOffset * stickyPos;
      const y = packYPosition + stickyPos * config.stickyOffset;

      const sticky = miro.board.createStickyNote({
        x,
        y,
        width: reference.width,
        shape: reference.shape,
        style: {
          fillColor: config.colors.at(packPos),
        },
      });

      waitFor.push(sticky);
    }
  }

  const stickies = await Promise.all(waitFor);

  if (config.selectItems) {
    await miro.board.select({ id: stickies.map((s) => s.id) });
  }

  if (config.zoomTo) {
    await miro.board.viewport.zoomTo(stickies);
  }
}
