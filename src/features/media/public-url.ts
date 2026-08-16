export const INVITATION_MEDIA_BUCKET = "invitation-media";

export function getInvitationMediaPublicUrl(mediaId: string) {
  return `/media/${encodeURIComponent(mediaId)}`;
}
