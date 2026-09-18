import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchPublicEvent, publicAssetUrl, type PublicEvent } from './api'
import { toEmbeddableStreamUrl, useCountdown } from './useCountdown'
import fullLogo from './assets/full_logo.png'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function CountdownStrip({ target, big }: { target: string; big?: boolean }) {
  const { days, hours, minutes, seconds, isPast } = useCountdown(target)
  if (isPast) {
    return <span className="live-tag">LIVE NOW</span>
  }
  const units = [
    { value: days, label: 'D' },
    { value: hours, label: 'H' },
    { value: minutes, label: 'M' },
    { value: seconds, label: 'S' },
  ]
  return (
    <div className={`countdown ${big ? 'countdown--big' : ''}`}>
      {units.map((u) => (
        <div key={u.label} className="countdown__unit">
          <div className="countdown__value">{String(u.value).padStart(2, '0')}</div>
          <div className="countdown__label">{u.label}</div>
        </div>
      ))}
    </div>
  )
}

function VideoStage({ streamLink, scheduledAt }: { streamLink: string | null; scheduledAt: string }) {
  const { isPast } = useCountdown(scheduledAt)
  const embedUrl = streamLink ? toEmbeddableStreamUrl(streamLink) : null
  const stageRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isWide, setIsWide] = useState(false)

  useEffect(() => {
    const handler = () => setIsFullscreen(document.fullscreenElement === stageRef.current)
    document.addEventListener('fullscreenchange', handler)
    return () => document.removeEventListener('fullscreenchange', handler)
  }, [])

  const toggleFullscreen = () => {
    if (!stageRef.current) return
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void stageRef.current.requestFullscreen().catch(() => undefined)
    }
  }

  return (
    <div
      ref={stageRef}
      className={`video-stage ${isFullscreen ? 'video-stage--fullscreen' : ''} ${isWide ? 'video-stage--wide' : ''}`}
    >
      <div className="video-stage__controls">
        <button className="icon-btn" title={isWide ? 'Default Width' : 'Full Width'} onClick={() => setIsWide((w) => !w)}>
          ⇔
        </button>
        <button className="icon-btn" title="Full Screen" onClick={toggleFullscreen}>
          ⛶
        </button>
      </div>

      {isPast && embedUrl ? (
        <iframe
          src={embedUrl}
          title="Live stream"
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          className="video-stage__iframe"
        />
      ) : isPast ? (
        <div className="video-stage__placeholder">
          <span className="live-tag">LIVE NOW</span>
          {streamLink && (
            <a className="btn btn--primary" href={streamLink} target="_blank" rel="noreferrer">
              Join Live
            </a>
          )}
        </div>
      ) : (
        <div className="video-stage__placeholder">
          <span className="starts-in-label">Starts in</span>
          <CountdownStrip target={scheduledAt} big />
        </div>
      )}
    </div>
  )
}

function SpeakerAvatar({ fileId }: { fileId: string | null }) {
  if (!fileId) {
    return <div className="speaker-avatar speaker-avatar--placeholder">👤</div>
  }
  return <img className="speaker-avatar" src={publicAssetUrl(fileId)} alt="Speaker" />
}

function EventContent({ event }: { event: PublicEvent }) {
  const posterUrl = event.posterImageFileId ? publicAssetUrl(event.posterImageFileId) : null

  const backgroundStyle = posterUrl
    ? {
        backgroundImage: `linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(15,23,42,0.94) 60%, rgba(15,23,42,0.98) 100%), url(${posterUrl})`,
      }
    : undefined

  return (
    <div
      className={`event-page ${!posterUrl ? (event.category === 'tech_talk' ? 'event-page--gradient-purple' : 'event-page--gradient-teal') : ''}`}
      style={backgroundStyle}
    >
      <div className="event-page__inner">
        <div className="event-page__brand">
          <img src={fullLogo} alt="SGIC" className="event-page__brand-logo" />
        </div>
        <div className="event-page__header">
          <span className="category-tag">{event.category === 'tech_talk' ? 'TECH TALK' : 'EVENT'}</span>
          <h1 className="event-title">{event.title}</h1>

          {event.inviteMessage && <p className="invite-message">"{event.inviteMessage}"</p>}

          <div className="event-meta">
            <span>📅 {formatDate(event.scheduledAt)}</span>
            {event.location && <span>📍 {event.location}</span>}
          </div>
        </div>

        <div className="event-columns">
          <VideoStage streamLink={event.streamLink} scheduledAt={event.scheduledAt} />

          <div className="event-side">
            {event.category === 'tech_talk' && event.speakerName && (
              <div className="speaker-card">
                <div className="speaker-card__text">
                  <div className="speaker-name">{event.speakerName}</div>
                  <div className="speaker-title">
                    {[event.speakerDesignation, event.speakerCompany].filter(Boolean).join(' @ ')}
                  </div>
                  {event.speakerBio && <p className="speaker-bio">{event.speakerBio}</p>}
                </div>
                <SpeakerAvatar fileId={event.speakerPhotoFileId} />
              </div>
            )}

            {event.description && <p className="event-description">{event.description}</p>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function EventPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<PublicEvent | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetchPublicEvent(id)
      .then((data) => {
        if (!cancelled) setEvent(data)
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load event')
      })
    return () => {
      cancelled = true
    }
  }, [id])

  if (error) {
    return (
      <div className="event-page event-page--gradient-purple">
        <div className="event-page__inner event-page__error">
          <h2>{error}</h2>
          <p>This event link may be invalid or the event hasn't been published yet.</p>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="event-page event-page--gradient-purple">
        <div className="event-page__inner event-page__loading">Loading…</div>
      </div>
    )
  }

  return <EventContent event={event} />
}
