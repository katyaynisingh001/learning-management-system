export const getYouTubeVideoId = (url) => {
  if (typeof url !== 'string') return ''

  const value = url.trim()
  try {
    const parsedUrl = new URL(value)
    const hostname = parsedUrl.hostname.replace(/^www\./, '')

    if (hostname === 'youtu.be') {
      return parsedUrl.pathname.split('/').filter(Boolean)[0] || value
    }

    if (['youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtube-nocookie.com'].includes(hostname)) {
      return parsedUrl.searchParams.get('v')
        || parsedUrl.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/)?.[1]
        || value
    }
  } catch {
    return value
  }

  return value
}
