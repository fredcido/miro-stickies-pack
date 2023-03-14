import * as React from "react";
import { createRoot } from "react-dom/client";
import { StickyNoteColor } from "@mirohq/websdk-types";
import classnames from "classnames";

import {
  SlButton,
  SlButtonGroup,
  SlDropdown,
  SlMenu,
  SlMenuItem,
} from "@shoelace-style/shoelace/dist/react";

import {
  defaultConfig,
  saveConfig,
  getConfig,
  createPack,
  ContentStrategy,
} from "./pack";
import type { PackConfig } from "./pack";

const saveModes = {
  save: {
    label: "Save",
    variant: "primary",
  },
  create: {
    label: "Create pack",
    variant: "neutral",
  },
  saveAndCreate: {
    label: "Save & Create pack",
    variant: "warning",
  },
} as const;

const App: React.FC = () => {
  const [config, setConfig] = React.useState<PackConfig>(defaultConfig);
  const [formState, setFormState] = React.useState<"idle" | "saving">("idle");
  const [saveMode, setSaveMode] = React.useState<
    typeof saveModes[keyof typeof saveModes]
  >(saveModes.saveAndCreate);

  const isSaving = React.useMemo(() => formState === "saving", [formState]);

  React.useEffect(() => {
    const fetchSavedConfig = async () => {
      const existingConfig = await getConfig();
      if (existingConfig) {
        setConfig((data) => ({ ...data, ...existingConfig }));
      }
    };

    fetchSavedConfig();
  }, []);

  const set = React.useCallback(
    <K extends keyof PackConfig, V extends PackConfig[K]>(key: K, value: V) => {
      setConfig((data) => ({
        ...data,
        [key]: value,
      }));
    },
    []
  );

  const handleChange = React.useCallback(
    <K extends keyof PackConfig>(key: K) =>
      (
        ev: React.FormEvent<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
      ) => {
        const { currentTarget: element } = ev;
        const { value } = element;
        let parsedValue: number | string = value;
        if (element.type === "number") {
          parsedValue = +value;
        }

        // @ts-expect-error
        set(key, parsedValue);
      },
    [set]
  );

  const handleColor = React.useCallback(
    (color: StickyNoteColor) => {
      const { colors } = config;

      const newColors = colors.includes(color)
        ? colors.filter((c) => c !== color)
        : [...config.colors, color];

      setConfig((config) => ({
        ...config,
        colors: newColors,
      }));
    },
    [setConfig, config]
  );

  const handleReset = React.useCallback(() => {
    const reset = async () => {
      await saveConfig(defaultConfig);
      setConfig(defaultConfig);
    };
    reset();
  }, [setConfig]);

  const handleSelectColors = React.useCallback(
    (flag: boolean) => {
      setConfig((config) => ({
        ...config,
        colors: flag ? defaultConfig.colors : [],
      }));
    },
    [setConfig]
  );

  const handleFormSubmit = React.useCallback(
    (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      setFormState("saving");
      const save = async () => {
        switch (saveMode.label) {
          case saveModes.create.label:
            await createPack({ config });
            break;
          case saveModes.save.label:
            await saveConfig(config);
            break;
          default:
            await saveConfig(config);
            await createPack({ config });
        }

        if (saveMode.label !== saveModes.create.label) {
          await miro.board.notifications.showInfo("Settings saved");
        }
      };

      save().finally(() => setFormState("idle"));

      return false;
    },
    [config, saveMode]
  );

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="info">
        <p>
          Stickies packs are sets of{" "}
          <a target="_blank" href="https://miro.com/online-sticky-notes/">
            digital sticky notes
          </a>{" "}
          you can add to your Miro board. They are useful for keeping meetings
          and workshops on task. Using the Stickies Packs App, users can
          customise and quickly duplicate pre-labeled sticky packs into any
          board.
        </p>
        <p>
          You can also <strong>double-click</strong> on the app icon to create
          your pack based on the saved settings.
        </p>
      </div>
      <div className="form-group">
        <label htmlFor="packs">
          Packs
          <span
            title="How many packs do you want to create?"
            className="icon icon-help-question"
          ></span>
        </label>
        <div className="input-group">
          <input
            className="input input-small"
            type="number"
            min="1"
            max="30"
            placeholder="e.g. 5"
            name="packs"
            value={config.packs}
            onChange={handleChange("packs")}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="stickies">
          Stickies
          <span
            title="How many stickies do you want to create?"
            className="icon icon-help-question"
          ></span>
        </label>
        <div className="input-group">
          <input
            className="input input-small"
            type="number"
            min="1"
            max="30"
            placeholder="e.g. 5"
            name="stickies"
            value={config.stickies}
            onChange={handleChange("stickies")}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="columns">
          Columns
          <span
            title="In how many columns do you want to distribute your packs?"
            className="icon icon-help-question"
          ></span>
        </label>
        <div className="input-group">
          <input
            className="input input-small"
            type="number"
            min="1"
            max="30"
            placeholder="e.g. 5"
            name="columns"
            value={config.columns}
            onChange={handleChange("columns")}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="stickyOffset">
          Stickies offset
          <span
            title="What's the offset distance in between each sticky note on each pack?"
            className="icon icon-help-question"
          ></span>
        </label>
        <div className="input-group">
          <input
            className="input input-small"
            type="number"
            min="1"
            max="30"
            placeholder="e.g. 5"
            name="stickyOffset"
            value={config.stickyOffset}
            onChange={handleChange("stickyOffset")}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="stickyGap">
          Stickies gap
          <span
            title="What's the offset distance in between each pack?"
            className="icon icon-help-question"
          ></span>
        </label>
        <div className="input-group">
          <input
            className="input input-small"
            type="number"
            min="1"
            max="30"
            placeholder="e.g. 5"
            name="stickyGap"
            value={config.stickyGap}
            onChange={handleChange("stickyGap")}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="shape">
          Shape
          <span
            title="What's the shape of your sticky notes?"
            className="icon icon-help-question"
          ></span>
        </label>
        <select
          className="select select-small"
          value={config.shape}
          id="shape"
          onChange={handleChange("shape")}
        >
          <option value="square">Square</option>
          <option value="rectangle">Rectangle</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="content">
          Content
          <span
            title="Define the content for your sticky notes"
            className="icon icon-help-question"
          ></span>
        </label>
        <select
          className="select select-small"
          value={config.contentStrategy}
          id="content"
          onChange={handleChange("contentStrategy")}
        >
          {Object.values(ContentStrategy).map((value) => (
            <option value={value} key={value}>
              {value}
            </option>
          ))}
        </select>
      </div>

      {config.contentStrategy === ContentStrategy.CUSTOM && (
        <div className="form-group">
          <label htmlFor="contentTemplate">
            Template
            <span
              title="Create your custom templates using the variables as in the example"
              className="icon icon-help-question"
            ></span>
          </label>
          <div className="input-group">
            <textarea
              className="textarea textarea-small"
              placeholder={defaultConfig.contentTemplate}
              name="contentTemplate"
              value={config.contentTemplate}
              rows={3}
              onChange={handleChange("contentTemplate")}
            />
          </div>
        </div>
      )}

      <div className="form-group">
        <div className="color-label">
          <label htmlFor="stickyGap">Colors</label>
          <label className="toggle" title="Select/Unselect colors">
            <input
              type="checkbox"
              checked={Boolean(config.colors.length)}
              onChange={(ev) => handleSelectColors(ev.target.checked)}
            />
            <span></span>
          </label>
        </div>

        <div className="colors">
          {defaultConfig.colors.map((color) => (
            <button
              title={color}
              key={color}
              type="button"
              style={{ backgroundColor: color.replace("_", "") }}
              onClick={() => handleColor(color)}
              className={classnames("color", {
                active: config.colors.includes(color),
              })}
            >
              {config.colors.includes(color) && "✓"}
            </button>
          ))}
        </div>
      </div>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={config.selectItems}
          onChange={(ev) => set("selectItems", ev.target.checked)}
        />
        <span>Select items</span>
      </label>

      <label className="checkbox">
        <input
          type="checkbox"
          checked={config.zoomTo}
          onChange={(ev) => set("zoomTo", ev.target.checked)}
        />
        <span>Zoom to pack</span>
      </label>

      <div className="toolbar">
        <SlButtonGroup style={{ width: "100%" }}>
          <SlButton
            style={{ width: "100%" }}
            variant={saveMode.variant}
            type="submit"
            loading={isSaving}
          >
            {saveMode.label}
          </SlButton>
          <SlDropdown placement="bottom-end">
            <SlButton
              slot="trigger"
              variant={saveMode.variant}
              caret
            ></SlButton>
            <SlMenu>
              {Object.entries(saveModes).map(([key, mode]) => (
                <SlMenuItem key={key} onClick={() => setSaveMode(mode)}>
                  {mode.label}
                </SlMenuItem>
              ))}
            </SlMenu>
          </SlDropdown>
        </SlButtonGroup>

        <button
          className="button button-secondary button-small"
          type="reset"
          onClick={handleReset}
        >
          Reset default values
        </button>

        <div className="contact">
          <a
            href="https://github.com/fredcido/miro-stickies-pack/issues"
            target="_blank"
            title="Submit your feedback, questions or report an issue"
          >
            <span className="m2 icon icon-help-question"></span>
          </a>
          <a
            href="mailto:platform-frameworks@miro.com"
            target="_blank"
            title="Direct contact to provide feedback"
          >
            <span className="m2 icon icon-comment-feedback"></span>
          </a>
        </div>
      </div>
    </form>
  );
};

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
