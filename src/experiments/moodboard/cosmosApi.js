const isDev = import.meta.env.DEV

// In dev, Vite proxy fetches the profile HTML and we parse client-side.
// In prod, a Cloudflare Worker does the fetch + parse and returns JSON.
const PROFILE_BASE = isDev ? '/api/cosmos-profile' : 'https://cosmos-proxy.hello-4aa.workers.dev'

/**
 * Build a CDN image URL, routing through the Vite proxy in dev.
 */
export function cosmosImageUrl(uuid, w = 400) {
  return isDev
    ? `/api/cosmos/${uuid}?format=webp&w=${w}`
    : `https://cdn.cosmos.so/${uuid}?format=webp&w=${w}`
}

/**
 * Extract a Cosmos username from a URL or plain string.
 * Handles: "andy", "cosmos.so/andy", "https://www.cosmos.so/andy"
 */
export function parseUsername(input) {
  const trimmed = input.trim().replace(/\/+$/, '')
  const urlMatch = trimmed.match(/cosmos\.so\/([a-zA-Z0-9_.-]+)/)
  if (urlMatch) return urlMatch[1]
  if (/^[a-zA-Z0-9_.-]+$/.test(trimmed)) return trimmed
  return null
}

/**
 * Fetch and parse a Cosmos profile's elements.
 */
export async function fetchCosmosProfile(username) {
  if (isDev) {
    return fetchViaDev(username)
  }
  return fetchViaWorker(username)
}

/**
 * Dev mode: fetch profile HTML through Vite proxy, parse client-side.
 */
async function fetchViaDev(username) {
  const res = await fetch(`${PROFILE_BASE}/${username}`)
  if (!res.ok) throw new Error('Profile not found')

  const html = await res.text()
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)
  if (!match) throw new Error('Could not parse profile data')

  const nextData = JSON.parse(match[1])
  const apolloState = nextData.props?.pageProps?.initialApolloState
  if (!apolloState) throw new Error('No profile data found')

  return parseApolloState(apolloState, username)
}

/**
 * Prod mode: Cloudflare Worker returns pre-parsed Apollo state JSON.
 */
async function fetchViaWorker(username) {
  const res = await fetch(`${PROFILE_BASE}?username=${encodeURIComponent(username)}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `Failed to load profile (${res.status})`)
  }
  const apolloState = await res.json()
  return parseApolloState(apolloState, username)
}

/**
 * Parse Apollo cache into normalized elements.
 */
function parseApolloState(state, username) {
  // Find user profile
  const userKey = Object.keys(state).find((k) => k.startsWith('UserPublicProfile:'))
  const userObj = userKey ? state[userKey] : null

  // Find elements list in ROOT_QUERY
  const rootQuery = state.ROOT_QUERY || {}
  const elementsQueryKey = Object.keys(rootQuery).find((k) =>
    k.startsWith('userPublicElementsV1')
  )
  const elementsList = rootQuery[elementsQueryKey]
  const elementRefs = elementsList?.items || []

  // Resolve element references
  const elements = elementRefs
    .map((ref) => {
      const key = ref.__ref || ref
      const el = state[key]
      if (!el || !el.image) return null

      const imageUrl = el.image.url || ''
      const uuid = extractUuid(imageUrl)
      if (!uuid) return null

      return {
        id: String(el.id),
        cosmosId: String(el.id),
        imageUuid: uuid,
        imageUrl: cosmosImageUrl(uuid),
        title:
          el.generatedCaption?.text ||
          el.authorName ||
          el.text ||
          'Untitled',
        aspectRatio: el.image.aspectRatio || 1,
        naturalWidth: el.image.width || 300,
        naturalHeight: el.image.height || 300,
      }
    })
    .filter(Boolean)

  return {
    user: userObj
      ? { username: userObj.username, fullName: userObj.fullName, bio: userObj.bio }
      : { username },
    elements,
  }
}

function extractUuid(cdnUrl) {
  if (!cdnUrl) return null
  const match = cdnUrl.match(/cdn\.cosmos\.so\/([a-f0-9-]+)/i)
  return match ? match[1] : null
}
