import { ElegantFloralTemplate } from "./elegant-floral/elegant-floral-template";
import { ModernMinimalTemplate } from "./modern-minimal/modern-minimal-template";
import { NusantaraContemporaryTemplate } from "./nusantara-contemporary/nusantara-contemporary-template";
import type { InvitationTemplateProps } from "./template-contract";

export function InvitationTemplate(props: InvitationTemplateProps) {
  switch (props.document.presentation.templateKey) {
    case "elegant-floral":
      return <ElegantFloralTemplate {...props} />;
    case "nusantara-contemporary":
      return <NusantaraContemporaryTemplate {...props} />;
    case "modern-minimal":
      return <ModernMinimalTemplate {...props} />;
  }
}
