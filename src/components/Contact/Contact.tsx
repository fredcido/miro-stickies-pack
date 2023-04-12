import React from "react";
import { Tooltip } from "@mirohq/design-system-tooltip";

import "./Contact.css";

type ContactProps = {};

export function Contact({}: ContactProps) {
  return (
    <div className="contact">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <a
            href="https://github.com/fredcido/miro-stickies-pack/issues"
            target="_blank"
          >
            <span className="m2 icon icon-help-question"></span>
            Learn more
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <span className="tooltip-content">
            Customise and quickly duplicate pre-labeled sticky packs into any
            board with Stickies packs.
          </span>
        </Tooltip.Content>
      </Tooltip>

      <a
        href="https://forms.gle/MBLznkCctCvpgbCn9"
        target="_blank"
        title="Direct contact to provide feedback"
      >
        <span className="m2 icon icon-comment-feedback"></span>
        Send Feedback
      </a>
    </div>
  );
}

export default Contact;
