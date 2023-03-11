import * as React from "react";
import { createRoot } from "react-dom/client";
import { StickyNoteColor } from "@mirohq/websdk-types";
import classnames from "classnames";

import {
  defaultConfig,
  saveConfig,
  getConfig,
  createPack,
  ContentStrategy,
} from "./pack";
import type { PackConfig } from "./pack";

const App: React.FC = () => {
  const [config, setConfig] = React.useState<PackConfig>(defaultConfig);

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

      const save = async () => {
        await saveConfig(config);
        await createPack({ config });
      };

      save();

      return false;
    },
    [config]
  );

  return (
    <form onSubmit={handleFormSubmit}>
      <em className="info">
        You can <strong>double-click</strong> on the app icon to create your
        pack based on the saved config.
      </em>
      <div className="form-group">
        <label htmlFor="packs">Packs</label>
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
        <label htmlFor="stickies">Stickies</label>
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
        <label htmlFor="columns">Columns</label>
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
        <label htmlFor="stickyOffset">Sticky offset</label>
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
        <label htmlFor="stickyGap">Sticky gap</label>
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
        <label htmlFor="shape">Shape</label>
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
        <label htmlFor="content">Content</label>
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
          <label htmlFor="contentTemplate">Template</label>
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
            ></button>
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
        <button className="button button-primary button-small" type="submit">
          Save & Create pack
        </button>

        <button
          className="button button-secondary button-small"
          type="reset"
          onClick={handleReset}
        >
          Reset default values
        </button>
      </div>
    </form>
  );
};

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
