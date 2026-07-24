/** Run fn now if the tab is visible, otherwise the first time it becomes visible.
    Keeps load animations from crawling through their timelines (throttled rAF)
    while the page sits in a background tab. */
export function whenVisible(fn: () => void) {
  if (!document.hidden) {
    fn()
    return
  }
  const onVis = () => {
    if (!document.hidden) {
      document.removeEventListener('visibilitychange', onVis)
      fn()
    }
  }
  document.addEventListener('visibilitychange', onVis)
}
