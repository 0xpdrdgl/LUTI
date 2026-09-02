export function setStatus(el: HTMLElement, text: string, state?: 'error' | 'success') {
  el.textContent = text
  if (state) el.dataset.state = state
  else delete el.dataset.state
}

/**
 * Depois de salvar com sucesso, atualiza a pre-visualizacao de um campo de
 * imagem no lugar, sem recarregar a pagina. Em producao a pagina eh lida do
 * ultimo deploy publicado - ela ainda nao tem o que acabou de ser salvo (o
 * site republica sozinho em segundo plano, mas leva alguns segundos). Usar
 * o valor que o servidor confirmou ter gravado evita mostrar dado velho.
 *
 * `outerFieldId` eh o id do wrapper `.editar-field` que contem o
 * `.editar-image-field` (label + preview + controles), ou o id do
 * proprio `.editar-image-field` quando nao ha wrapper.
 */
export function updateImagePreview(outerFieldId: string, newUrl: string | null | undefined) {
  const outer = document.getElementById(outerFieldId)
  const container = outer?.classList.contains('editar-image-field') ? outer : outer?.querySelector('.editar-image-field')
  if (!container) return

  if (!newUrl) {
    container.querySelector('img.editar-image-preview')?.remove()
    return
  }

  let img = container.querySelector('img.editar-image-preview') as HTMLImageElement | null
  if (!img) {
    img = document.createElement('img')
    img.className = 'editar-image-preview'
    const controls = container.querySelector('.editar-image-controls')
    container.insertBefore(img, controls)
  }
  img.src = newUrl

  const nameEl = container.querySelector('.editar-file-name') as HTMLSpanElement | null
  if (nameEl) nameEl.textContent = ''
}

function makeDragHandle(): HTMLSpanElement {
  const handle = document.createElement('span')
  handle.className = 'editar-drag-handle'
  handle.textContent = '⠿'
  handle.title = 'Arraste para reordenar'
  return handle
}

export function makeLinkRow(label = '', href = ''): HTMLDivElement {
  const row = document.createElement('div')
  row.className = 'editar-array-row'
  row.draggable = true
  row.appendChild(makeDragHandle())
  const labelInput = document.createElement('input')
  labelInput.className = 'editar-input'
  labelInput.type = 'text'
  labelInput.placeholder = 'Texto'
  labelInput.dataset.key = 'label'
  labelInput.value = label
  const hrefInput = document.createElement('input')
  hrefInput.className = 'editar-input'
  hrefInput.type = 'text'
  hrefInput.placeholder = 'URL'
  hrefInput.dataset.key = 'href'
  hrefInput.value = href
  const removeBtn = document.createElement('button')
  removeBtn.type = 'button'
  removeBtn.className = 'editar-array-remove'
  removeBtn.textContent = 'Remover'
  removeBtn.addEventListener('click', () => row.remove())
  row.append(labelInput, hrefInput, removeBtn)
  return row
}

export function makeTextRow(value = '', placeholder = 'Texto'): HTMLDivElement {
  const row = document.createElement('div')
  row.className = 'editar-array-row'
  row.draggable = true
  row.appendChild(makeDragHandle())
  const textarea = document.createElement('textarea')
  textarea.className = 'editar-textarea'
  textarea.placeholder = placeholder
  textarea.value = value
  textarea.dataset.key = 'value'
  const removeBtn = document.createElement('button')
  removeBtn.type = 'button'
  removeBtn.className = 'editar-array-remove'
  removeBtn.textContent = 'Remover'
  removeBtn.addEventListener('click', () => row.remove())
  row.append(textarea, removeBtn)
  return row
}

export interface ObjectFieldSpec {
  key: string
  type: 'text' | 'textarea' | 'select'
  placeholder?: string
  options?: { label: string; value: string }[]
}

/**
 * Generic reorderable row for an array of objects with 2+ text/select
 * fields (e.g. { titulo, descricao } or { label, valor, href, icone }).
 */
export function makeObjectRow(specs: ObjectFieldSpec[], values: Record<string, string> = {}): HTMLDivElement {
  const row = document.createElement('div')
  row.className = 'editar-array-row editar-array-row-multi'
  row.draggable = true
  row.appendChild(makeDragHandle())
  const fields = document.createElement('div')
  fields.className = 'editar-array-row-fields'
  for (const spec of specs) {
    let el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    if (spec.type === 'textarea') {
      el = document.createElement('textarea')
      el.className = 'editar-textarea'
      el.value = values[spec.key] ?? ''
    } else if (spec.type === 'select') {
      el = document.createElement('select')
      el.className = 'editar-select'
      for (const opt of spec.options ?? []) {
        const option = document.createElement('option')
        option.value = opt.value
        option.textContent = opt.label
        if (opt.value === values[spec.key]) option.selected = true
        el.appendChild(option)
      }
    } else {
      el = document.createElement('input')
      el.type = 'text'
      el.className = 'editar-input'
      el.value = values[spec.key] ?? ''
    }
    if (spec.placeholder && 'placeholder' in el) el.placeholder = spec.placeholder
    el.dataset.key = spec.key
    fields.appendChild(el)
  }
  const removeBtn = document.createElement('button')
  removeBtn.type = 'button'
  removeBtn.className = 'editar-array-remove'
  removeBtn.textContent = 'Remover'
  removeBtn.addEventListener('click', () => row.remove())
  row.append(fields, removeBtn)
  return row
}

export function readObjectArray(listId: string, keys: string[]): Record<string, string>[] {
  const list = document.getElementById(listId)
  if (!list) return []
  return Array.from(list.querySelectorAll('.editar-array-row')).map((row) => {
    const out: Record<string, string> = {}
    for (const key of keys) {
      const el = row.querySelector(`[data-key="${key}"]`) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null
      out[key] = el?.value ?? ''
    }
    return out
  })
}

export function readLinkArray(listId: string): { label: string; href: string }[] {
  const list = document.getElementById(listId)
  if (!list) return []
  return Array.from(list.querySelectorAll('.editar-array-row')).map((row) => ({
    label: (row.querySelector('[data-key="label"]') as HTMLInputElement)?.value ?? '',
    href: (row.querySelector('[data-key="href"]') as HTMLInputElement)?.value ?? '',
  }))
}

export function readTextArray(listId: string): string[] {
  const list = document.getElementById(listId)
  if (!list) return []
  return Array.from(list.querySelectorAll('.editar-array-row')).map(
    (row) => (row.querySelector('[data-key="value"]') as HTMLTextAreaElement)?.value ?? ''
  )
}

/**
 * Generic native drag-and-drop reordering for a list of sibling elements
 * (table rows, div rows, anything). Call once per container; matches items
 * by `itemSelector`. `onDrop` fires once per completed drag with the final
 * element order.
 */
export function enableDragReorder(
  container: HTMLElement,
  itemSelector: string,
  onDrop?: (movedItem: HTMLElement) => void
) {
  let dragEl: HTMLElement | null = null

  container.addEventListener('dragstart', (e) => {
    const target = (e.target as HTMLElement).closest(itemSelector) as HTMLElement | null
    if (!target) return
    dragEl = target
    target.classList.add('is-dragging')
    e.dataTransfer?.setData('text/plain', '')
    if (e.dataTransfer) e.dataTransfer.effectAllowed = 'move'
  })

  container.addEventListener('dragend', () => {
    dragEl?.classList.remove('is-dragging')
    dragEl = null
  })

  container.addEventListener('dragover', (e) => {
    if (!dragEl) return
    e.preventDefault()
    const target = (e.target as HTMLElement).closest(itemSelector) as HTMLElement | null
    if (!target || target === dragEl) return
    const rect = target.getBoundingClientRect()
    const before = (e.clientY - rect.top) / rect.height < 0.5
    const ref = before ? target : target.nextElementSibling
    target.parentElement?.insertBefore(dragEl, ref)
  })

  container.addEventListener('drop', (e) => {
    if (!dragEl) return
    e.preventDefault()
    onDrop?.(dragEl)
  })
}
