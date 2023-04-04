import React from "react";
import classnames from "classnames";
import {
  IconStickyNote,
  IconStickyNoteWide,
} from "@mirohq/design-system-icons";
import type { StickyNoteShape } from "@mirohq/websdk-types";

import "./Shapes.css";

type ShapeProps = {
  shape: StickyNoteShape;
  onChange: (shape: StickyNoteShape) => void;
};

export function Shapes({ shape, onChange }: ShapeProps) {
  return (
    <div className="form-group">
      <label htmlFor="shape">Shape</label>
      <div className="tabs shapes">
        <div className="tabs-header-list">
          <div
            tabIndex={0}
            onClick={() => onChange("square")}
            className={classnames("tab", {
              ["tab-active"]: shape === "square",
            })}
          >
            <div className="tab-text">
              <IconStickyNote />
              Square
            </div>
          </div>
          <div
            tabIndex={0}
            onClick={() => onChange("rectangle")}
            className={classnames("tab", {
              ["tab-active"]: shape === "rectangle",
            })}
          >
            <div className="tab-text">
              <IconStickyNoteWide />
              Wide
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Shapes;
