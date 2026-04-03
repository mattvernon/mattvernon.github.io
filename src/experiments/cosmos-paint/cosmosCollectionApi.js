const isDev = import.meta.env.DEV
const GRAPHQL_ENDPOINT = 'https://api.cosmos.so/graphql'

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
 * Fetch images from a Cosmos collection via the public GraphQL API.
 * Returns { name, elements: [{ id, imageUrl, width, height, aspectRatio }] }
 */
export async function fetchCollectionImages(username, slug) {
  const query = `query GetClusterElements($slug: String!, $ownerUsername: String!) {
    cluster(input: { slug: $slug, ownerUsername: $ownerUsername }) {
      id
      name
      numberOfElements
      elements {
        items {
          id
          image {
            url
            width
            height
            aspectRatio
          }
        }
      }
    }
  }`

  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query,
      variables: { slug, ownerUsername: username },
    }),
  })

  if (!res.ok) throw new Error(`Failed to fetch collection (${res.status})`)

  const json = await res.json()
  if (json.errors?.length) {
    throw new Error(json.errors[0].message || 'GraphQL error')
  }

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

  return { name: cluster.name, elements }
}

/**
 * Preload an array of image URLs, resolving when `minReady` have loaded.
 * Continues loading the rest in the background.
 */
export function preloadImages(elements, minReady = 8) {
  return new Promise((resolve) => {
    let loaded = 0
    let resolved = false
    const target = Math.min(minReady, elements.length)

    if (elements.length === 0) {
      resolve()
      return
    }

    elements.forEach((el) => {
      const img = new Image()
      img.src = el.imageUrl
      const done = () => {
        loaded++
        if (!resolved && loaded >= target) {
          resolved = true
          resolve()
        }
      }
      img.onload = done
      img.onerror = done
    })

    // Safety timeout
    setTimeout(() => {
      if (!resolved) {
        resolved = true
        resolve()
      }
    }, 6000)
  })
}

function extractUuid(cdnUrl) {
  if (!cdnUrl) return null
  const match = cdnUrl.match(/cdn\.cosmos\.so\/([a-f0-9-]+)/i)
  return match ? match[1] : null
}
