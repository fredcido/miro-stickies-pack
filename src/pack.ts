import type {
  StickyNote,
  Item,
  Rect,
  StickyNoteShape,
} from "@mirohq/websdk-types";
import { StickyNoteColor } from "@mirohq/websdk-types";

export enum ContentStrategy {
  EMPTY = "Empty",
  PACK_INDEX = "Pack index",
  STICKY_INDEX = "Sticky index",
  OVERALL_INDEX = "Overall index",
  CUSTOM = "Custom",
}

export type PackConfig = {
  columns: number;
  packs: number;
  stickies: number;
  stickyOffset: number;
  stickyGap: number;
  zoomTo: boolean;
  selectItems: boolean;
  colors: StickyNoteColor[];
  shape: StickyNoteShape;
  contentStrategy: ContentStrategy;
  contentTemplate: string;
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
  shape: "square",
  contentStrategy: ContentStrategy.EMPTY,
  contentTemplate:
    "Overall: #{overallIndex}, Pack: #{packIndex}, Sticky: #{stickyIndex}",
} as const;

type CreatePackOpts = {
  config?: typeof defaultConfig;
  referenceItem?: StickyNote;
};

type ContentOps = {
  packIndex: number;
  stickyIndex: number;
  overallIndex: number;
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
    return referenceItem;
  }

  const viewport = await miro.board.viewport.get();

  const values = {
    width: 200,
    height: 200,
    x: viewport.x + viewport.width / 2,
    y: viewport.y + viewport.height / 2,
  } as const;

  return values;
}

function buildContent(opts: CreatePackOpts, values: ContentOps): string {
  const { config = defaultConfig } = opts;
  const { contentTemplate, contentStrategy } = config;

  let content = "";
  switch (contentStrategy) {
    case ContentStrategy.PACK_INDEX:
      content = `${values.packIndex}`;
      break;
    case ContentStrategy.STICKY_INDEX:
      content = `${values.stickyIndex}`;
      break;
    case ContentStrategy.OVERALL_INDEX:
      content = `${values.overallIndex}`;
      break;
    case ContentStrategy.CUSTOM:
      content = contentTemplate;
      Object.entries(values).forEach(([key, value]) => {
        const identifier = `#{${key}}`;
        content = content.replaceAll(identifier, String(value));
      });
      break;
    default:
      content = "";
  }

  return content;
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
  for (let packIndex = 0; packIndex < config.packs; packIndex++) {
    packXPosition =
      startPosition + marginLeft * Math.floor(packIndex % config.columns);

    if (packIndex > 0 && packIndex % config.columns === 0) {
      packYPosition = packYPosition + (reference.height + gap);
    }

    for (let stickyIndex = 0; stickyIndex < config.stickies; stickyIndex++) {
      const x = packXPosition + config.stickyOffset * stickyIndex;
      const y = packYPosition + stickyIndex * config.stickyOffset;

      const sticky = miro.board.createStickyNote({
        x,
        y,
        width: reference.width,
        content: buildContent(
          { config },
          {
            packIndex: packIndex + 1,
            stickyIndex: stickyIndex + 1,
            overallIndex: (packIndex + 1) * (stickyIndex + 1),
          }
        ),
        shape: Object.hasOwn(reference, "shape")
          ? // @ts-expect-error
            reference.shape
          : config.shape,
        style: {
          fillColor: config.colors.length
            ? config.colors[packIndex % config.colors.length]
            : StickyNoteColor.LightYellow,
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
