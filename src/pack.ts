import type {
  StickyNote,
  Item,
  Rect,
  StickyNoteShape,
  OnlineUserInfo,
  Tag,
} from "@mirohq/websdk-types";
import { StickyNoteColor } from "@mirohq/websdk-types";
import { track, Event } from "./analytics";

export enum ContentStrategy {
  EMPTY = "Empty",
  PACK_INDEX = "Pack index",
  STICKY_INDEX = "Sticky index",
  OVERALL_INDEX = "Overall index",
  ONLINE_USERS_PER_PACK = "Online users per pack",
  ONLINE_USERS_PER_ITEM = "Online users per item",
  CUSTOM = "Custom",
}

export enum TagStrategy {
  EMPTY = "Empty",
  ONLINE_USERS_PER_PACK = "Online users per pack",
  ONLINE_USERS_PER_ITEM = "Online users per item",
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
  tagStrategy: TagStrategy;
  contentTemplate: string;
  debug: boolean;
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
  tagStrategy: TagStrategy.EMPTY,
  contentTemplate:
    "Overall: #{overallIndex}, Pack: #{packIndex}, Sticky: #{stickyIndex}",
  debug: false,
} as const;

type CreatePackOpts = {
  config?: typeof defaultConfig;
  referenceItem?: StickyNote;
  source: "custom_action" | "panel";
};

type ContentOps = {
  packIndex: number;
  stickyIndex: number;
  overallIndex: number;
  onlineUsers: OnlineUserInfo[];
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

function log(debug: boolean, ...args: any): void {
  if (debug) {
    console.log("[STICKIES_PACK]", args);
  }
}

export async function saveConfig(config: PackConfig) {
  await miro.board.setAppData("config", config);
}

export async function getConfig() {
  const { config } = await miro.board.getAppData();
  log(true, { config });
  if (config) {
    return config as PackConfig;
  }

  return defaultConfig;
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

async function getOrCreateTag(user: OnlineUserInfo) {
  const tags = (await miro.board.get({
    type: "tag",
  })) as Tag[];

  let tag = tags.find(
    (tag) => tag.title.toLocaleLowerCase() === user.name.toLocaleLowerCase()
  );

  console.log("Existing", { tags, user, tag });

  if (!tag) {
    tag = await miro.board.createTag({
      title: user.name,
    });

    console.log("Created", { tag });
  }

  return tag;
}

function getCurrentUser(
  onlineUsers: OnlineUserInfo[],
  index: number
): OnlineUserInfo | undefined {
  let userIndex = index - 1;
  if (userIndex >= onlineUsers.length) {
    userIndex = userIndex % onlineUsers.length;
  }

  const user = onlineUsers.at(userIndex);

  console.log({ userIndex, user, index, onlineUsers });

  return user;
}

async function buildTags(
  opts: CreatePackOpts,
  values: ContentOps
): Promise<Tag[]> {
  const { config = defaultConfig } = opts;
  const { tagStrategy } = config;

  log(config.debug, "buildTags", {
    tagStrategy,
  });

  let tags: Tag[] = [];
  switch (tagStrategy) {
    case TagStrategy.ONLINE_USERS_PER_PACK: {
      const { packIndex, onlineUsers } = values;
      const user = getCurrentUser(onlineUsers, packIndex);

      if (user) {
        const tag = await getOrCreateTag(user);
        tags = [tag];
      }
      break;
    }
    case TagStrategy.ONLINE_USERS_PER_ITEM: {
      const { stickyIndex, onlineUsers } = values;
      const user = getCurrentUser(onlineUsers, stickyIndex);

      if (user) {
        const tag = await getOrCreateTag(user);
        tags = [tag];
      }
      break;
    }
  }

  return tags;
}

async function buildContent(
  opts: CreatePackOpts,
  values: ContentOps
): Promise<string> {
  const { config = defaultConfig } = opts;
  const { contentTemplate, contentStrategy } = config;

  log(config.debug, "buildContent", {
    contentStrategy,
  });

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
    case ContentStrategy.ONLINE_USERS_PER_PACK: {
      const { packIndex, onlineUsers } = values;
      const user = getCurrentUser(onlineUsers, packIndex);
      content = user?.name ?? "";

      break;
    }
    case ContentStrategy.ONLINE_USERS_PER_ITEM: {
      const { stickyIndex, onlineUsers } = values;
      const user = getCurrentUser(onlineUsers, stickyIndex);
      content = user?.name ?? "";

      break;
    }
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

function proportionalOffset(config: PackConfig, reference: Rect): number {
  const offset = (config.stickyOffset * reference.width) / 300;
  log(config.debug, "proportionalOffset", {
    offset,
    width: reference.width,
    defaultOffset: config.stickyOffset,
  });
  return offset;
}

export async function createPack(opts: CreatePackOpts = { source: "panel" }) {
  const { config = defaultConfig, referenceItem, source } = opts;
  const reference = referenceItem ?? (await getDefaultValues());

  const onlineUsers = await miro.board.getOnlineUsers();

  track(Event.PACKS_CREATED, { config, source });

  log(config.debug, { config });

  const startPosition = config.stickyGap + reference.x + reference.width;
  const gap =
    config.stickyGap + config.stickies * proportionalOffset(config, reference);

  const marginLeft = reference.width + gap;
  let packYPosition = reference.y;
  let packXPosition = startPosition + marginLeft;

  log(config.debug, "INIT", {
    startPosition,
    gap,
    marginLeft,
    packYPosition,
    packXPosition,
  });

  const waitFor: Promise<StickyNote>[] = [];
  for (let packIndex = 0; packIndex < config.packs; packIndex++) {
    packXPosition =
      startPosition + marginLeft * Math.floor(packIndex % config.columns);

    if (packIndex > 0 && packIndex % config.columns === 0) {
      packYPosition = packYPosition + (reference.height + gap);
    }

    log(config.debug, "PACK", { packYPosition, packXPosition, packIndex });

    for (let stickyIndex = 0; stickyIndex < config.stickies; stickyIndex++) {
      const x =
        packXPosition + proportionalOffset(config, reference) * stickyIndex;
      const y =
        packYPosition + proportionalOffset(config, reference) * stickyIndex;

      const fillColor = config.colors.length
        ? config.colors[packIndex % config.colors.length]
        : StickyNoteColor.LightYellow;

      const shape = Object.hasOwn(reference, "shape")
        ? // @ts-expect-error
          reference.shape
        : config.shape;

      const configOpts = {
        config,
        source,
      };

      const generateOpts = {
        packIndex: packIndex + 1,
        stickyIndex: stickyIndex + 1,
        overallIndex: (packIndex + 1) * (stickyIndex + 1),
        onlineUsers,
      };

      const content = await buildContent(configOpts, generateOpts);
      const tags = await buildTags(configOpts, generateOpts);

      log(config.debug, "STICK", {
        x,
        y,
        packIndex,
        stickyIndex,
        fillColor,
        shape,
        content,
      });

      const sticky = miro.board.createStickyNote({
        x,
        y,
        width: reference.width,
        content,
        shape,
        style: {
          fillColor,
        },
        tagIds: tags.map((t) => t.id),
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
