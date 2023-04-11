import * as React from "react";
import { createRoot } from "react-dom/client";
import { StickyNoteColor } from "@mirohq/websdk-types";
import classnames from "classnames";
import { Tooltip } from "@mirohq/design-system-tooltip";

import { Colors } from "./components/Colors";
import { Shapes } from "./components/Shapes";
import { Contact } from "./components/Contact";
import {
  track,
  Event,
  isTracking,
  enableTracking,
  disbleTracking,
} from "./analytics";

import {
  defaultConfig,
  saveConfig,
  getConfig,
  createPack,
  ContentStrategy,
} from "./pack";
import type { PackConfig } from "./pack";
import SelectNumbers from "./components/SelectNumbers/SelectNumbers";

const App: React.FC = () => {
  const [config, setConfig] = React.useState<PackConfig>(defaultConfig);
  const [isTrackingAnalytics, setLocalTrack] = React.useState<boolean>(
    isTracking()
  );
  const [formState, setFormState] = React.useState<"idle" | "saving">("idle");
  const [tab, setTab] = React.useState<"style" | "layout" | "actions">("style");

  const isSaving = React.useMemo(() => formState === "saving", [formState]);

  const setTrackingAnalytics = React.useCallback(
    (flag: boolean) => {
      setLocalTrack(flag);
      if (flag) {
        enableTracking();
      } else {
        disbleTracking();
      }
    },
    [setLocalTrack]
  );

  const changeTab = React.useCallback(
    (newTab: typeof tab) => {
      track(Event.TAB_CHANGED, { from: tab, to: newTab });
      setTab(newTab);
    },
    [tab, setTab]
  );

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
      setConfig((data) => {
        track(Event.PROPERTY_CHANGED, {
          property: key,
          value,
          oldValue: data[key],
        });
        return { ...data, [key]: value };
      });
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

  const handleToggleColors = React.useCallback(
    (flag: boolean) => {
      const colors = flag ? defaultConfig.colors : [];
      track(Event.PROPERTY_CHANGED, { property: "colors", value: colors });
      setConfig((config) => ({
        ...config,
        colors: colors,
      }));
    },
    [setConfig]
  );

  const handleFormSubmit = React.useCallback(
    (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();

      setFormState("saving");
      const save = async () => {
        await saveConfig(config);
        await createPack({ config, source: "panel" });

        track(Event.SETTING_SAVED, { config });
      };

      save().finally(() => setFormState("idle"));

      return false;
    },
    [config]
  );

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="tabs">
        <div className="tabs-header-list">
          <div
            tabIndex={0}
            onClick={() => changeTab("style")}
            className={classnames("tab", {
              ["tab-active"]: tab === "style",
            })}
          >
            <div className="tab-text">Style</div>
          </div>
          <div
            tabIndex={0}
            onClick={() => changeTab("layout")}
            className={classnames("tab", {
              ["tab-active"]: tab === "layout",
            })}
          >
            <div className="tab-text">Layout</div>
          </div>
          <div
            tabIndex={0}
            onClick={() => changeTab("actions")}
            className={classnames("tab", {
              ["tab-active"]: tab === "actions",
            })}
          >
            <div className="tab-text">Actions</div>
          </div>
        </div>
      </div>

      <section className="tabs-container">
        {tab === "style" && (
          <article>
            <div className="form-group">
              <label htmlFor="packs">
                Packs
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <span className="icon icon-help-question"></span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span className="tooltip-content">
                      How many packs do you want to create?
                    </span>
                  </Tooltip.Content>
                </Tooltip>
              </label>
              <div className="input-group">
                <SelectNumbers
                  max={20}
                  value={config.packs}
                  onChange={(packs) => set("packs", packs)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="stickies">
                Stickies per pack
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <span className="icon icon-help-question"></span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span className="tooltip-content">
                      How many stickies do you want to create?
                    </span>
                  </Tooltip.Content>
                </Tooltip>
              </label>
              <div className="input-group">
                <SelectNumbers
                  max={30}
                  value={config.stickies}
                  onChange={(stickies) => set("stickies", stickies)}
                />
              </div>
            </div>

            <Shapes
              shape={config.shape}
              onChange={(shape) => set("shape", shape)}
            />

            <Colors
              onSelect={handleColor}
              onToggleAll={handleToggleColors}
              colors={defaultConfig.colors}
              selectedColors={config.colors}
            />
          </article>
        )}

        {tab === "layout" && (
          <article>
            <div className="form-group">
              <label htmlFor="columns">
                Columns
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <span className="icon icon-help-question"></span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span className="tooltip-content">
                      In how many columns do you want to distribute your packs?
                    </span>
                  </Tooltip.Content>
                </Tooltip>
              </label>
              <div className="input-group">
                <SelectNumbers
                  max={30}
                  value={config.columns}
                  onChange={(columns) => set("columns", columns)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="stickyOffset">
                Stickies offset
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <span className="icon icon-help-question"></span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span className="tooltip-content">
                      What's the offset distance in between each sticky note on
                      each pack?
                    </span>
                  </Tooltip.Content>
                </Tooltip>
              </label>
              <div className="input-group">
                <SelectNumbers
                  max={30}
                  value={config.stickyOffset}
                  onChange={(stickyOffset) => set("stickyOffset", stickyOffset)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="stickyGap">
                Stickies gap
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <span className="icon icon-help-question"></span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span className="tooltip-content">
                      What's the offset distance in between each pack?
                    </span>
                  </Tooltip.Content>
                </Tooltip>
              </label>
              <div className="input-group">
                <SelectNumbers
                  max={30}
                  value={config.stickyGap}
                  onChange={(stickyGap) => set("stickyGap", stickyGap)}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="content">
                Content
                <Tooltip>
                  <Tooltip.Trigger asChild>
                    <span className="icon icon-help-question"></span>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <span className="tooltip-content">
                      Define the content for your sticky notes
                    </span>
                  </Tooltip.Content>
                </Tooltip>
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
              <div className="form-group form-row">
                <label htmlFor="contentTemplate">
                  Template
                  <Tooltip>
                    <Tooltip.Trigger asChild>
                      <span className="icon icon-help-question"></span>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                      <span className="tooltip-content">
                        Create your custom templates using the variables as in
                        the example
                      </span>
                    </Tooltip.Content>
                  </Tooltip>
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
          </article>
        )}

        {tab === "actions" && (
          <article>
            <div className="row">
              <label className="checkbox">
                <input
                  type="checkbox"
                  checked={isTrackingAnalytics}
                  onChange={(ev) => setTrackingAnalytics(ev.target.checked)}
                />
                <span>Track anonymized analytics (no PII)</span>
              </label>
              <Tooltip>
                <Tooltip.Trigger asChild>
                  <span className="icon icon-help-question"></span>
                </Tooltip.Trigger>
                <Tooltip.Content>
                  <span className="tooltip-content">
                    Track anonymized analytics metrics to understand user usage
                    and improve the app UX.{" "}
                    <a
                      href="https://mixpanel.com/legal/mixpanel-gdpr/"
                      target="_blank"
                    >
                      More info
                    </a>
                    .
                  </span>
                </Tooltip.Content>
              </Tooltip>
            </div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={config.selectItems}
                onChange={(ev) => set("selectItems", ev.target.checked)}
              />
              <span>Select items after creation</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={config.zoomTo}
                onChange={(ev) => set("zoomTo", ev.target.checked)}
              />
              <span>Zoom to pack</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={config.debug}
                onChange={(ev) => set("debug", ev.target.checked)}
              />
              <span>Enable debug</span>
            </label>
          </article>
        )}
      </section>

      <div className="toolbar">
        <button
          disabled={isSaving}
          className={classnames("button button-primary", {
            "button-loading": isSaving,
          })}
          type="submit"
        >
          Save & create
        </button>

        <Contact />
      </div>
    </form>
  );
};

track(Event.PAGE_LOAD, { page: "app" });

const container = document.getElementById("root")!;
const root = createRoot(container);
root.render(<App />);
