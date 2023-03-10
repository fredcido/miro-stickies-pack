import * as React from "react";
import { createRoot } from "react-dom/client";
import { StickyNoteColor } from "@mirohq/websdk-types";
import classnames from "classnames";

import { defaultConfig, saveConfig, getConfig, createPack } from "./pack";
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
    <K extends keyof PackConfig>(key: K, value: PackConfig[K]) => {
      setConfig((data) => ({
        ...data,
        [key]: value,
      }));
    },
    []
  );

  const handleChange = React.useCallback(
    <K extends keyof PackConfig>(key: K) =>
      (ev: React.FormEvent<HTMLInputElement>) => {
        const { value } = ev.currentTarget;
        // @ts-expect-error
        set(key, +value);
      },
    [set]
  );

  const handleColor = React.useCallback(
    (color: StickyNoteColor) => {
      const { colors } = config;
      if (colors.includes(color)) {
        const newColors = colors.filter((c) => c !== color);
        setConfig((config) => ({
          ...config,
          colors: newColors,
        }));
      } else {
        setConfig((config) => ({
          ...config,
          colors: [...config.colors, color],
        }));
      }
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
      <div className="form-group">
        <label htmlFor="packs">Packs</label>
        <div className="input-group">
          <input
            className="input input-small"
            type="number"
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
            placeholder="e.g. 5"
            name="stickies"
            value={config.stickies}
            onChange={handleChange("stickies")}
          />
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="stickyOffset">Sticky offset</label>
        <div className="input-group">
          <input
            className="input input-small"
            type="number"
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
            placeholder="e.g. 5"
            name="stickyGap"
            value={config.stickyGap}
            onChange={handleChange("stickyGap")}
          />
        </div>
      </div>
      <div className="form-group">
        <label htmlFor="stickyGap">Colors</label>
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

      <button className="button button-primary" type="submit">
        Create
      </button>
      <button
        className="button button-secondary"
        type="reset"
        onClick={handleReset}
      >
        Reset default values
      </button>
    </form>
  );
};

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
