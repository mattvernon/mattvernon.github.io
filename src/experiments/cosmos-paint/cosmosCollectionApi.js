const isDev = import.meta.env.DEV

/**
 * Build a CDN image URL, routing through the Vite proxy in dev
 * to avoid COEP blocking cross-origin images.
 */
function cosmosImageUrl(uuid, w = 400) {
  return isDev
    ? `/api/cosmos/${uuid}?format=webp&w=${w}`
    : `https://cdn.cosmos.so/${uuid}?format=webp&w=${w}`
}

/**
 * Parse a Cosmos collection URL into username + slug.
 * Handles: "dappboi/design", "cosmos.so/dappboi/design",
 *          "https://www.cosmos.so/dappboi/design"
 */
export function parseCollectionUrl(input) {
  const trimmed = input.trim().replace(/\/+$/, '')

  // Full or partial URL: cosmos.so/user/slug
  const urlMatch = trimmed.match(/cosmos\.so\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/)
  if (urlMatch) return { username: urlMatch[1], slug: urlMatch[2] }

  // Bare path: user/slug
  const pathMatch = trimmed.match(/^([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)$/)
  if (pathMatch) return { username: pathMatch[1], slug: pathMatch[2] }

  return null
}

/**
 * Fetch images from a Cosmos collection.
 * In dev: scrapes the full page HTML via Vite proxy for all images.
 * In prod: uses the GraphQL API (limited to 20 items, but no CORS issues).
 * Returns { name, elements: [{ id, imageUrl, width, height, aspectRatio }] }
 */
export async function fetchCollectionImages(username, slug) {
  if (isDev) {
    return fetchViaPageScrape(username, slug)
  }
  return fetchViaGraphQL(username, slug)
}

const GRAPHQL_ENDPOINT = 'https://api.cosmos.so/graphql'

async function fetchViaGraphQL(username, slug) {
  const query = `query($slug: String!, $ownerUsername: String!) {
    cluster(input: { slug: $slug, ownerUsername: $ownerUsername }) {
      id name numberOfElements
      elements { items { id image { url width height aspectRatio } } }
    }
  }`

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { slug, ownerUsername: username } }),
  })

  if (!res.ok) throw new Error(`Failed to fetch collection (${res.status})`)

  const json = await res.json()
  if (json.errors?.length) throw new Error(json.errors[0].message || 'GraphQL error')

  const cluster = json.data?.cluster
  if (!cluster) throw new Error('Collection not found')

  const elements = (cluster.elements?.items || [])
    .filter((item) => item.image?.url)
    .map((item) => {
      const uuid = extractUuid(item.image.url)
      return {
        id: String(item.id),
        imageUrl: uuid ? cosmosImageUrl(uuid) : `${item.image.url}?format=webp&w=400`,
        width: item.image.width || 400,
        height: item.image.height || 400,
        aspectRatio: item.image.aspectRatio || 1,
      }
    })

  if (elements.length === 0) throw new Error('No images found in this collection')
  return { name: cluster.name, elements }
}

async function fetchViaPageScrape(username, slug) {
  const res = await fetch(`/api/cosmos-profile/${username}/${slug}`)
  if (!res.ok) throw new Error('Collection not found')

  const html = await res.text()

  const nameMatch = html.match(
    /"ownerUsername"\s*:\s*"[^"]*"[^}]*?"name"\s*:\s*"([^"]+)"/
  ) || html.match(/"name"\s*:\s*"([^"]+)"[^}]*?"slug"\s*:\s*"[^"]+"/);
  const name = nameMatch ? nameMatch[1] : slug

  const mediaPattern =
    /https:\/\/cdn\.cosmos\.so\/([a-f0-9-]+)(?:[^}]*?)width.?:(\d+)[^}]*?height.?:(\d+)/g
  const seen = new Set()
  const elements = []
  let match

  while ((match = mediaPattern.exec(html)) !== null) {
    const [, uuid, w, h] = match
    if (seen.has(uuid)) continue
    seen.add(uuid)

    const width = parseInt(w, 10)
    const height = parseInt(h, 10)
    if (width < 50 || height < 50) continue

    elements.push({
      id: uuid,
      imageUrl: cosmosImageUrl(uuid),
      width,
      height,
      aspectRatio: width / height,
    })
  }

  if (elements.length === 0) throw new Error('No images found in this collection')
  return { name, elements }
}

/**
 * Preload an array of image URLs, resolving when `minReady` have loaded.
 * Continues loading the rest in the background.
 */
export function preloadImages(elements, minReady = 8) {
  return new Promise((resolve) => {
    const valid = []
    let settled = 0
    let resolved = false
    const target = Math.min(minReady, elements.length)

    if (elements.length === 0) {
      resolve([])
      return
    }

    const tryResolve = () => {
      if (resolved) return
      if (valid.length >= target || settled >= elements.length) {
        resolved = true
        resolve(valid)
      }
    }

    elements.forEach((el) => {
      const img = new Image()
      img.src = el.imageUrl
      img.onload = () => {
        valid.push(el)
        settled++
        tryResolve()
      }
      img.onerror = () => {
        settled++
        tryResolve()
      }
    })

    // Safety timeout — resolve with whatever we have
    setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve(valid)
      }
    }, 8000)
  })
}

function extractUuid(cdnUrl) {
  if (!cdnUrl) return null
  const match = cdnUrl.match(/cdn\.cosmos\.so\/([a-f0-9-]+)/i)
  return match ? match[1] : null
}
