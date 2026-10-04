// Banner persistente do painel /editar que mostra o status real do deploy na
// Vercel depois de um "Salvar". Sem isso, a cliente salva, abre "Ver site" e
// ve a versao antiga (ou 404 num projeto novo) porque o build ainda nao
// terminou -- e acaba recriando o mesmo conteudo achando que nao salvou.
const STORAGE_KEY = 'editar_pending_deploy'
const POLL_INTERVAL_MS = 4000
const MAX_WAIT_MS = 6 * 60 * 1000 // depois disso paramos de fazer polling, mas deixamos o aviso

type StoredDeploy = { sha: string; startedAt: number }

export function watchDeploy(commitSha: string | null | undefined) {
  if (!commitSha) return
  const entry: StoredDeploy = { sha: commitSha, startedAt: Date.now() }
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(entry))
  } catch {
    // sessionStorage indisponivel (ex.: modo privado) -- sem banner, tudo bem
  }
  // setTimeout: as paginas reabilitam o botao no `finally` logo depois de
  // chamar watchDeploy, entao a trava precisa rodar depois disso. Tambem
  // ja comeca o banner aqui, pras paginas que nao recarregam depois de salvar.
  setTimeout(initDeployBanner, 0)
}

// sha sendo acompanhado agora -- um polling antigo para sozinho se outro comecar.
let activeSha: string | null = null

// Botoes de salvar/criar/excluir ficam travados enquanto a Vercel publica,
// pra cliente nao clicar de novo achando que nada aconteceu.
const LOCK_SELECTOR = '#editar-save, #n-criar, #delete-btn'
const LOCK_LABEL = 'Publicando… aguarde'

function lockButtons() {
  document.querySelectorAll<HTMLButtonElement>(LOCK_SELECTOR).forEach((btn) => {
    btn.disabled = true
    btn.classList.add('is-loading', 'is-deploy-locked')
    btn.title = 'Aguarde o site terminar de publicar'
    const label = btn.querySelector<HTMLElement>('.editar-save-label') ?? btn
    if (label.dataset.originalText === undefined) label.dataset.originalText = label.textContent ?? ''
    label.textContent = LOCK_LABEL
  })
}

function unlockButtons() {
  document.querySelectorAll<HTMLButtonElement>(LOCK_SELECTOR).forEach((btn) => {
    if (!btn.classList.contains('is-deploy-locked')) return
    btn.disabled = false
    btn.classList.remove('is-loading', 'is-deploy-locked')
    btn.removeAttribute('title')
    const label = btn.querySelector<HTMLElement>('.editar-save-label') ?? btn
    if (label.dataset.originalText !== undefined) {
      label.textContent = label.dataset.originalText
      delete label.dataset.originalText
    }
  })
}

function readPending(): StoredDeploy | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredDeploy
    if (typeof parsed.sha !== 'string' || typeof parsed.startedAt !== 'number') return null
    return parsed
  } catch {
    return null
  }
}

function clearPending() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

function ensureBannerEl(): HTMLDivElement {
  let el = document.getElementById('editar-deploy-banner') as HTMLDivElement | null
  if (el) return el
  el = document.createElement('div')
  el.id = 'editar-deploy-banner'
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  document.body.appendChild(el)
  return el
}

const MESSAGES = {
  polling: { icon: '<span class="editar-deploy-spinner"></span>', title: 'Publicando suas alterações…', body: 'Leva 1–2 minutos. Não precisa salvar de novo.' },
  ready: { icon: '✓', title: 'Pronto! O site já está atualizado.', body: 'Pode abrir o site para conferir.' },
  error: { icon: '!', title: 'Não foi possível publicar.', body: 'Suas alterações foram salvas, mas o site não atualizou. Avise o suporte.' },
  timeout: { icon: '…', title: 'Está demorando mais que o normal.', body: 'Pode continuar editando — o site atualiza sozinho quando terminar.' },
}

function render(el: HTMLDivElement, state: 'polling' | 'ready' | 'error' | 'timeout') {
  el.dataset.state = state
  el.hidden = false
  const m = MESSAGES[state]
  el.innerHTML = `<span class="editar-deploy-icon">${m.icon}</span><span class="editar-deploy-text"><strong>${m.title}</strong><span>${m.body}</span></span>`
  if (state === 'polling' && notifyPermission() === 'default') {
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'editar-deploy-notify-btn'
    btn.textContent = 'Me avisar quando terminar'
    btn.addEventListener('click', async () => {
      // Precisa ser num clique: Safari/Firefox so pedem permissao com gesto do usuario.
      await Notification.requestPermission().catch(() => 'denied')
      btn.remove()
    })
    el.appendChild(btn)
  }
}

const ESTIMATE_WAIT_MS = 90 * 1000

function notifyPermission(): NotificationPermission | 'unsupported' {
  return 'Notification' in window ? Notification.permission : 'unsupported'
}

// Notificacao do sistema, pra cliente ser avisada mesmo se trocou de aba
// enquanto o build rodava. Sem permissao, fica so o banner.
function notify(title: string, body: string) {
  if (notifyPermission() !== 'granted') return
  try {
    const n = new Notification(title, { body, tag: 'editar-deploy' })
    n.onclick = () => {
      window.focus()
      n.close()
    }
  } catch {
    // ignore (ex.: Android Chrome exige service worker pra Notification)
  }
}

function markReady(el: HTMLDivElement) {
  render(el, 'ready')
  clearPending()
  unlockButtons()
  notify('Site atualizado ✓', 'As alterações já estão publicadas no site.')
  setTimeout(() => { el.hidden = true }, 10000)
}

export function initDeployBanner() {
  const pending = readPending()
  if (!pending) return

  const el = ensureBannerEl()
  const age = Date.now() - pending.startedAt

  if (age > MAX_WAIT_MS) {
    clearPending()
    return
  }

  activeSha = pending.sha
  render(el, 'polling')
  lockButtons()

  const poll = async () => {
    if (activeSha !== pending.sha) return
    if (Date.now() - pending.startedAt > MAX_WAIT_MS) {
      render(el, 'timeout')
      clearPending()
      unlockButtons()
      return
    }
    try {
      const res = await fetch(`/api/deploy-status?sha=${encodeURIComponent(pending.sha)}`)
      const data = await res.json()

      if (data.state === 'UNKNOWN') {
        // Sem VERCEL_API_TOKEN configurado no servidor -- não dá pra saber o
        // status real, então caímos numa estimativa de tempo fixa.
        const remaining = ESTIMATE_WAIT_MS - (Date.now() - pending.startedAt)
        if (remaining <= 0) {
          markReady(el)
        } else {
          setTimeout(poll, Math.min(remaining, POLL_INTERVAL_MS))
        }
        return
      }
      if (data.state === 'READY') {
        markReady(el)
        return
      }
      if (data.state === 'ERROR' || data.state === 'CANCELED') {
        render(el, 'error')
        clearPending()
        unlockButtons()
        notify('Falha ao publicar', 'As alterações foram salvas, mas o site não atualizou. Avise o suporte.')
        return
      }
      // PENDING, QUEUED, BUILDING
      setTimeout(poll, POLL_INTERVAL_MS)
    } catch {
      setTimeout(poll, POLL_INTERVAL_MS)
    }
  }

  setTimeout(poll, POLL_INTERVAL_MS)
}
