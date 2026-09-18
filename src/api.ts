export interface EventAudience {
  allRoles: boolean
  roles: string[]
  specificUserIds: string[]
}

export type EventCategory = 'tech_talk' | 'other'
export type EventStatus = 'planned' | 'upcoming' | 'completed' | 'cancelled'

export interface PublicEvent {
  id: string
  category: EventCategory
  title: string
  description: string | null
  speakerName: string | null
  speakerDesignation: string | null
  speakerCompany: string | null
  speakerPhotoFileId: string | null
  speakerBio: string | null
  scheduledAt: string
  durationMinutes: number | null
  streamLink: string | null
  recordingLink: string | null
  location: string | null
  posterImageFileId: string | null
  inviteMessage: string | null
  audience: EventAudience
  status: EventStatus
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// Gateway serves the JSON API; file-service is hit directly for binary
// assets (same split the main platform uses — the gateway proxy can't
// handle binary payloads). Both default to this page's own hostname so
// the same build works whether it's opened via IP or a real domain.
const API_BASE = import.meta.env.VITE_API_URL ?? `http://${window.location.hostname}:3000/api/v1`
const FILE_BASE = import.meta.env.VITE_FILE_SERVICE_URL ?? `http://${window.location.hostname}:3060/api/v1`

export async function fetchPublicEvent(id: string): Promise<PublicEvent> {
  const res = await fetch(`${API_BASE}/hrms/events/public/${id}`)
  if (!res.ok) {
    throw new Error(res.status === 404 ? 'Event not found' : 'Failed to load event')
  }
  const body = (await res.json()) as ApiResponse<PublicEvent>
  return body.data
}

export function publicAssetUrl(fileId: string): string {
  return `${FILE_BASE}/files/${fileId}/public-asset`
}
