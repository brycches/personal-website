import { onMounted, onUnmounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Shared page motion: scroll reveals (.reveal), stat counters ([data-count]),
    and any page-specific setup — all gated on tab visibility, wrapped in a
    gsap.context so every trigger and tween is cleaned up on route change. */
export function usePageFx(setup?: () => void) {
  let ctx: gsap.Context | undefined

  onMounted(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) {
      document.body.classList.add('no-motion')
      return
    }

    gsap.registerPlugin(ScrollTrigger)

    whenVisible(() => {
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
          gsap.fromTo(
            el,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 0.7,
              ease: 'power2.out',
              scrollTrigger: { trigger: el, start: 'top 88%' },
            },
          )
        })

        gsap.utils.toArray<HTMLElement>('[data-count]').forEach((el) => {
          const target = parseInt(el.getAttribute('data-count') || '0', 10)
          const compact = el.getAttribute('data-format') === 'compact'
          const fmt = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
          const obj = { val: 0 }
          gsap.to(obj, {
            val: target,
            duration: 1.6,
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: 'top 90%' },
            onUpdate: () => {
              const v = Math.round(obj.val)
              el.textContent = compact ? fmt.format(v) : String(v)
            },
          })
        })

        setup?.()
      })
      ScrollTrigger.refresh()
    })
  })

  onUnmounted(() => {
    ctx?.revert()
  })
}
