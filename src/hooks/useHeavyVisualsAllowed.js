import { useEffect, useState } from 'react'

/**
 * Should this device get the Three.js background?
 *
 * The 3D scene is ~887 kB (236 kB gzipped) — by far the largest thing the site
 * ships. On a mid-range Android over mobile data that is seconds of nothing, and the
 * people we most want to reach are exactly the ones on those phones. It is
 * decoration, so it is the first thing to drop.
 *
 * Skipped when any of these hold:
 *   - narrow viewport (phones and small tablets)
 *   - the user asked for reduced motion
 *   - the browser reports a slow connection or data-saver
 *   - the device reports few CPU cores
 *
 * On everything else it loads only after the browser is idle, so it can never
 * compete with content for the first paint.
 */
export function useHeavyVisualsAllowed() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const narrow = window.matchMedia?.('(max-width: 900px)').matches
    const coarseAndSmall = window.matchMedia?.('(pointer: coarse) and (max-width: 1100px)').matches

    // navigator.connection is Chromium-only; absence just means "no signal".
    const connection = navigator.connection
    const slowNetwork =
      connection?.saveData === true ||
      ['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '')

    // Four cores is an ordinary laptop, not a weak device, and excluding those
  // silently removed the background for people whose machines render it fine.
  const weakCpu = (navigator.hardwareConcurrency ?? 8) <= 2

    if (reducedMotion || narrow || coarseAndSmall || slowNetwork || weakCpu) {
      return
    }

    // Wait for idle so the 3D chunk never delays first paint.
    const schedule =
      window.requestIdleCallback ?? ((cb) => window.setTimeout(() => cb(), 1200))
    const cancel = window.cancelIdleCallback ?? window.clearTimeout

    const handle = schedule(() => setAllowed(true), { timeout: 3000 })
    return () => cancel(handle)
  }, [])

  return allowed
}
