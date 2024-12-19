import React from "react";
import { Tooltip } from "@mirohq/design-system-tooltip";
import {
  IconSocialX,
  IconSocialFacebook,
  IconSocialLinkedin,
  IconPlug,
} from "@mirohq/design-system";

import "./Contact.css";

type ContactProps = {};

const shareText =
  "Check%20out%20this%20amazing%20Miro%20app%20I%27ve%20been%20using%20to%20create%20stickies%20packs%20%23miro%20%23stickiespacks%0Ahttps%3A%2F%2Fmiro.com%2Fmarketplace%2Fstickies-packs%2F";

export function Contact({}: ContactProps) {
  return (
    <div className="contact">
      <Tooltip>
        <Tooltip.Trigger asChild>
          <a
            href={`https://twitter.com/intent/tweet?text=${shareText}`}
            target="_blank"
          >
            <IconSocialX />
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <span className="tooltip-content">
            Share about Miro Stickies pack on X/Twitter
          </span>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <a
            href="https://www.facebook.com/sharer/sharer.php?u=https%3A//miro.com/marketplace/stickies-packs/"
            target="_blank"
          >
            <IconSocialFacebook />
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <span className="tooltip-content">
            Share about Miro Stickies pack on Facebook
          </span>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <a
            href={`https://www.linkedin.com/shareArticle?mini=true&title=${shareText}&url=https%3A//miro.com/marketplace/stickies-packs/`}
            target="_blank"
          >
            <IconSocialLinkedin />
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <span className="tooltip-content">
            Share about Miro Stickies pack on Linkedin
          </span>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <a
            href="https://miro.com/marketplace/stickies-packs/"
            target="_blank"
            title="Direct contact to provide feedback"
          >
            <IconPlug />
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <span className="tooltip-content">
            Check Stickies Packs on the Miro marketplace
          </span>
        </Tooltip.Content>
      </Tooltip>

      <Tooltip>
        <Tooltip.Trigger asChild>
          <a href="https://forms.gle/iKzLBr6meoma1RkF9" target="_blank">
            <span className="m2 icon icon-comment-feedback"></span>
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content>
          <span className="tooltip-content">
            Share your feedback, issue or comment with us
          </span>
        </Tooltip.Content>
      </Tooltip>
    </div>
  );
}

export default Contact;
