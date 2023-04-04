import React from "react";
import { StickyNoteColor } from "@mirohq/websdk-types";
import classnames from "classnames";

import "./Colors.css";

type ColorProps = {
  onSelect: (color: StickyNoteColor) => void;
  onToggleAll: (toggle: boolean) => void;
  colors: StickyNoteColor[];
  selectedColors?: StickyNoteColor[];
};

const colorMapping = {
  [StickyNoteColor.Gray.toString()]: "rgb(245, 246, 248)",
  [StickyNoteColor.LightYellow]: "rgb(255, 249, 177)",
  [StickyNoteColor.Yellow]: "rgb(245, 209, 40)",
  [StickyNoteColor.Orange]: "rgb(255, 157, 72)",
  [StickyNoteColor.LightGreen]: "rgb(213, 246, 146)",
  [StickyNoteColor.Green]: "rgb(201, 223, 86)",
  [StickyNoteColor.DarkGreen]: "rgb(147, 210, 117)",
  [StickyNoteColor.Cyan]: "rgb(103, 198, 192)",
  [StickyNoteColor.LightPink]: "rgb(255, 206, 224)",
  [StickyNoteColor.Pink]: "rgb(234, 148, 187)",
  [StickyNoteColor.Violet]: "rgb(198, 162, 210)",
  [StickyNoteColor.Red]: "rgb(240, 147, 157)",
  [StickyNoteColor.Blue]: "rgb(108, 216, 250)",
  [StickyNoteColor.DarkBlue]: "rgb(158, 169, 255)",
  [StickyNoteColor.Black]: "rgb(0, 0, 0)",
} as const;

export function Colors({
  onToggleAll,
  onSelect,
  colors,
  selectedColors = [],
}: ColorProps) {
  return (
    <div>
      <div className="color-label">
        <label htmlFor="stickyGap">Colors</label>
        <label className="toggle">
          <input
            type="checkbox"
            defaultChecked
            onChange={(ev) => onToggleAll(ev.target.checked)}
          />
          <span>Use all colors</span>
        </label>
      </div>

      <div className="colors">
        {colors.map((color) => (
          <button
            title={color}
            key={color}
            type="button"
            style={{
              backgroundColor: colorMapping[color]
                ? colorMapping[color]
                : color.replace("_", ""),
            }}
            onClick={() => onSelect(color)}
            className={classnames("color", {
              active: selectedColors.includes(color),
            })}
          ></button>
        ))}
      </div>
    </div>
  );
}

export default Colors;
