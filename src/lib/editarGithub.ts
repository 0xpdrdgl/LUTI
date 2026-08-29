const REPO_OWNER = '0xpdrdgl'
const REPO_NAME = 'LUTI'

function headers(token: string) {
  return { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json' }
}

function url(path: string) {
  return `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${path}`
}

export async function getFile(path: string, token: string): Promise<{ sha: string; content: string } | null> {
  const res = await fetch(url(path), { headers: headers(token) })
  if (!res.ok) return null
  return res.json()
}

export async function listDir(path: string, token: string): Promise<Array<{ name: string; path: string; sha: string }>> {
  const res = await fetch(url(path), { headers: headers(token) })
  if (!res.ok) return []
  const data = await res.json()
  return Array.isArray(data) ? data : []
}

export async function putFile(
  path: string,
  token: string,
  contentBase64: string,
  message: string,
  sha?: string
): Promise<Response> {
  return fetch(url(path), {
    method: 'PUT',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, content: contentBase64, ...(sha ? { sha } : {}) }),
  })
}

export async function deleteFile(path: string, token: string, sha: string, message: string): Promise<Response> {
  return fetch(url(path), {
    method: 'DELETE',
    headers: { ...headers(token), 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, sha }),
  })
}
