import React from "react";
import type { StickyNoteColor } from "@mirohq/websdk-types";
import classnames from "classnames";

import "./Colors.css";

type ColorProps = {
  onSelect: (color: StickyNoteColor) => void;
  onToggleAll: (toggle: boolean) => void;
  colors: StickyNoteColor[];
  selectedColors?: StickyNoteColor[];
};

const colorMapping: Record<StickyNoteColor, string> = {
  gray: "rgb(245, 246, 248)",
  light_yellow: "rgb(255, 249, 177)",
  yellow: "rgb(245, 209, 40)",
  orange: "rgb(255, 157, 72)",
  light_green: "rgb(213, 246, 146)",
  green: "rgb(201, 223, 86)",
  dark_green: "rgb(147, 210, 117)",
  cyan: "rgb(103, 198, 192)",
  light_pink: "rgb(255, 206, 224)",
  pink: "rgb(234, 148, 187)",
  violet: "rgb(198, 162, 210)",
  red: "rgb(240, 147, 157)",
  blue: "rgb(108, 216, 250)",
  dark_blue: "rgb(158, 169, 255)",
  light_blue: "rgb(108, 216, 250)",
  black: "rgb(0, 0, 0)",
} as const;

export function Colors({
  onToggleAll,
  onSelect,
  colors,
  selectedColors = [],
}: ColorProps) {
  const areAllSelected = React.useMemo(
    () => colors.length === selectedColors.length,
    [colors.length, selectedColors.length]
  );

  const handleToggle = () => {
    const newToggle = !areAllSelected;
    onToggleAll(newToggle);
  };

  return (
    <div>
      <div className="color-label">
        <label htmlFor="stickyGap">Colors</label>

        <a
          className="link link-primary"
          onClick={handleToggle}
          href="javascript:;"
        >
          {areAllSelected ? "Reset" : "Select all"}
        </a>
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
