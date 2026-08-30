export interface TourStep {
  selector: string
  title: string
  text: string
  /** Runs right before this step is shown — use it to expand a collapsed
   * section so its fields are visible for the spotlight to find. */
  onEnter?: () => void
}

const STYLE_ID = 'editar-tour-style'

function ensureStyle() {
  if (document.getElementById(STYLE_ID)) return
  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `
    .editar-tour-overlay {
      position: fixed;
      inset: 0;
      z-index: 500;
      background: transparent;
      pointer-events: none;
    }
    .editar-tour-spotlight {
      position: fixed;
      z-index: 501;
      border-radius: 8px;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.72);
      transition: all 0.25s ease;
      pointer-events: none;
    }
    .editar-tour-box {
      position: fixed;
      z-index: 502;
      max-width: 300px;
      background: #1e1e1e;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 8px;
      padding: 16px;
      color: #f0f0f0;
      font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      transition: top 0.25s ease, left 0.25s ease;
    }
    .editar-tour-box h3 {
      margin: 0 0 8px;
      font-size: 14px;
    }
    .editar-tour-box p {
      margin: 0 0 14px;
      font-size: 13px;
      opacity: 0.8;
      line-height: 1.5;
    }
    .editar-tour-box-footer {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }
    .editar-tour-progress {
      font-size: 11px;
      opacity: 0.5;
    }
    .editar-tour-buttons {
      display: flex;
      gap: 8px;
    }
    .editar-tour-skip {
      background: none;
      border: none;
      color: rgba(255, 255, 255, 0.55);
      font-size: 12px;
      cursor: pointer;
      padding: 6px 4px;
    }
    .editar-tour-next {
      background: var(--accent, #b5602f);
      color: #fff;
      border: none;
      padding: 7px 14px;
      border-radius: 5px;
      font-size: 12px;
      cursor: pointer;
    }
  `
  document.head.appendChild(style)
}

export function hasSeenTour(key: string): boolean {
  try {
    return localStorage.getItem(key) === 'true'
  } catch {
    return false
  }
}

function markTourSeen(key: string) {
  try {
    localStorage.setItem(key, 'true')
  } catch {
    // ignore storage errors (private browsing, etc.)
  }
}

let activeTourCleanup: (() => void) | null = null

export function startTour(steps: TourStep[], storageKey: string) {
  // Never run two tours at once (e.g. an auto-start racing a manual "Ver
  // tour" click) — tear down whatever is currently showing first.
  activeTourCleanup?.()

  ensureStyle()
  let index = 0

  const spotlight = document.createElement('div')
  spotlight.className = 'editar-tour-spotlight'
  const box = document.createElement('div')
  box.className = 'editar-tour-box'
  document.body.append(spotlight, box)

  const previousOverflow = document.body.style.overflow
  document.body.style.overflow = 'hidden'

  function cleanup() {
    spotlight.remove()
    box.remove()
    document.body.style.overflow = previousOverflow
    markTourSeen(storageKey)
    if (activeTourCleanup === cleanup) activeTourCleanup = null
  }
  activeTourCleanup = cleanup

  function render() {
    const step = steps[index]
    step.onEnter?.()
    const target = document.querySelector(step.selector) as HTMLElement | null
    if (!target || target.offsetParent === null) {
      index++
      if (index >= steps.length) cleanup()
      else render()
      return
    }

    // Unlock scroll just long enough to jump to the target instantly (no
    // smooth-scroll animation to race against), then re-lock before reading
    // its position so the spotlight always matches where it actually is.
    document.body.style.overflow = previousOverflow
    target.scrollIntoView({ block: 'center', behavior: 'auto' })
    document.body.style.overflow = 'hidden'

    requestAnimationFrame(() => {
      const rect = target.getBoundingClientRect()
      const pad = 6
      spotlight.style.top = `${rect.top - pad}px`
      spotlight.style.left = `${rect.left - pad}px`
      spotlight.style.width = `${rect.width + pad * 2}px`
      spotlight.style.height = `${rect.height + pad * 2}px`

      box.innerHTML = ''
      const h3 = document.createElement('h3')
      h3.textContent = step.title
      const p = document.createElement('p')
      p.textContent = step.text
      const footer = document.createElement('div')
      footer.className = 'editar-tour-box-footer'
      const progress = document.createElement('span')
      progress.className = 'editar-tour-progress'
      progress.textContent = `${index + 1} de ${steps.length}`
      const buttons = document.createElement('div')
      buttons.className = 'editar-tour-buttons'
      const skipBtn = document.createElement('button')
      skipBtn.className = 'editar-tour-skip'
      skipBtn.textContent = 'Pular tour'
      skipBtn.addEventListener('click', cleanup)
      const nextBtn = document.createElement('button')
      nextBtn.className = 'editar-tour-next'
      nextBtn.textContent = index === steps.length - 1 ? 'Concluir' : 'Próximo'
      nextBtn.addEventListener('click', () => {
        index++
        if (index >= steps.length) cleanup()
        else render()
      })
      buttons.append(skipBtn, nextBtn)
      footer.append(progress, buttons)
      box.append(h3, p, footer)

      const boxRect = box.getBoundingClientRect()
      let top = rect.bottom + 14
      if (top + boxRect.height > window.innerHeight - 16) top = rect.top - boxRect.height - 14
      if (top < 8) top = 8
      let left = Math.min(rect.left, window.innerWidth - boxRect.width - 16)
      if (left < 16) left = 16
      box.style.top = `${top}px`
      box.style.left = `${left}px`
    })
  }

  render()
}

export function maybeStartTour(steps: TourStep[], storageKey: string) {
  if (hasSeenTour(storageKey)) return
  setTimeout(() => startTour(steps, storageKey), 400)
}
