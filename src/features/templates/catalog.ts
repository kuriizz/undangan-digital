import {
  elegantFloralAccentKeys,
  elegantFloralTypographyKeys,
  invitationTemplateKeys,
  modernMinimalAccentKeys,
  modernMinimalTypographyKeys,
  nusantaraContemporaryAccentKeys,
  nusantaraContemporaryTypographyKeys,
  type InvitationAccentKey,
  type InvitationTemplateKey,
  type InvitationTypographyKey,
} from "@/features/invitations/content";

type TemplateOption<Key extends string> = {
  key: Key;
  label: string;
};

type TemplateDefinition = {
  key: InvitationTemplateKey;
  label: string;
  description: string;
  accents: readonly TemplateOption<InvitationAccentKey>[];
  typography: readonly TemplateOption<InvitationTypographyKey>[];
  defaultAccent: InvitationAccentKey;
  defaultTypography: InvitationTypographyKey;
};

export const invitationTemplateCatalog = {
  "modern-minimal": {
    key: "modern-minimal",
    label: "Modern Minimal",
    description: "Bersih, lapang, dan fokus pada nama serta foto pasangan.",
    accents: [
      { key: modernMinimalAccentKeys[0], label: "Mawar" },
      { key: modernMinimalAccentKeys[1], label: "Sage" },
      { key: modernMinimalAccentKeys[2], label: "Emas" },
    ],
    typography: [
      { key: modernMinimalTypographyKeys[0], label: "Modern" },
      { key: modernMinimalTypographyKeys[1], label: "Elegan" },
    ],
    defaultAccent: "rose",
    defaultTypography: "elegant",
  },
  "elegant-floral": {
    key: "elegant-floral",
    label: "Elegant Floral",
    description: "Editorial romantis dengan detail botanical yang lembut.",
    accents: [
      { key: elegantFloralAccentKeys[0], label: "Ivory & Rose" },
      { key: elegantFloralAccentKeys[1], label: "Blush & Burgundy" },
      { key: elegantFloralAccentKeys[2], label: "Champagne & Plum" },
    ],
    typography: [
      { key: elegantFloralTypographyKeys[0], label: "Romantic Serif" },
      { key: elegantFloralTypographyKeys[1], label: "Classic Serif" },
    ],
    defaultAccent: "ivory-rose",
    defaultTypography: "romantic-serif",
  },
  "nusantara-contemporary": {
    key: "nusantara-contemporary",
    label: "Nusantara Contemporary",
    description: "Geometris kontemporer dengan warna bumi yang berkarakter.",
    accents: [
      { key: nusantaraContemporaryAccentKeys[0], label: "Indigo & Emas" },
      { key: nusantaraContemporaryAccentKeys[1], label: "Terakota & Pasir" },
      { key: nusantaraContemporaryAccentKeys[2], label: "Hutan & Kuningan" },
    ],
    typography: [
      {
        key: nusantaraContemporaryTypographyKeys[0],
        label: "Contemporary Serif",
      },
      {
        key: nusantaraContemporaryTypographyKeys[1],
        label: "Geometric Sans",
      },
    ],
    defaultAccent: "indigo-gold",
    defaultTypography: "contemporary-serif",
  },
} as const satisfies Record<InvitationTemplateKey, TemplateDefinition>;

export const invitationTemplates = invitationTemplateKeys.map(
  (key) => invitationTemplateCatalog[key],
);

export function normalizeTemplateSelection(
  templateKey: InvitationTemplateKey,
  accent: string,
  typography: string,
) {
  const template = invitationTemplateCatalog[templateKey];
  const validAccent = template.accents.some((option) => option.key === accent);
  const validTypography = template.typography.some(
    (option) => option.key === typography,
  );

  return {
    templateKey,
    accent: validAccent
      ? (accent as InvitationAccentKey)
      : template.defaultAccent,
    typography: validTypography
      ? (typography as InvitationTypographyKey)
      : template.defaultTypography,
  };
}

export function isTemplateSelectionValid(
  templateKey: InvitationTemplateKey,
  accent: string,
  typography: string,
) {
  const normalized = normalizeTemplateSelection(
    templateKey,
    accent,
    typography,
  );
  return normalized.accent === accent && normalized.typography === typography;
}
