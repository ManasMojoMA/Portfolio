import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { metaForPath } from '../routes.meta'

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
  }, [pathname])
}
