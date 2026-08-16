import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { metaForPath, isKnownPath } from '../routes.meta'

/**
 * Keeps document.title and the description in sync during client-side navigation.
 *
 * This is NOT what fixes link previews — crawlers never run this. The served HTML
 * already carries the right tags (see scripts/generate-route-html.mjs). This exists
 * so the browser tab and back/forward history read correctly once the router takes
 * over and the URL changes without a page load.
 */
export function useRouteMeta() {
  const { pathname } = useLocation()

  useEffect(() => {
    const meta = metaForPath(pathname)
    if (document.title !== meta.title) document.title = meta.title

    const tag = document.querySelector('meta[name="description"]')
    if (tag && tag.getAttribute('content') !== meta.description) {
      tag.setAttribute('content', meta.description)
    }

    /**
     * Unknown paths render the home page rather than a dead end, which is a
     * deliberate choice for a marketing site — but without this they would also
     * be indexable, so /pricing, /contact-us and any typo anyone ever links to
     * would each become a duplicate of the homepage in search results.
     * Rendering it is fine; being indexed under a made-up URL is not.
     */
    const known = isKnownPath(pathname)
    let robots = document.querySelector('meta[name="robots"]')
    if (!known) {
      if (!robots) {
        robots = document.createElement('meta')
        robots.setAttribute('name', 'robots')
        document.head.appendChild(robots)
      }
      robots.setAttribute('content', 'noindex, follow')
    } else if (robots) {
      robots.remove()
    }
  }, [pathname])
}
