update public.invitations
set draft_content = draft_content || jsonb_build_object(
  'presentation',
  jsonb_build_object(
    'templateKey', 'modern-minimal',
    'accent', 'rose',
    'typography', 'elegant',
    'sections', jsonb_build_array('hero', 'event')
  )
)
where draft_content ->> 'schemaVersion' = '1'
  and not (draft_content ? 'presentation');

comment on column public.invitations.draft_content is
  'Server-validated, versioned editor content and presentation configuration.';
