export default {
  async fetch(request) {
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    const url = new URL(request.url)
    const username = url.searchParams.get('username')

    if (!username || !/^[a-zA-Z0-9_.-]+$/.test(username)) {
      return Response.json({ error: 'Invalid username' }, {
        status: 400,
        headers: corsHeaders,
      })
    }

    try {
      const res = await fetch(`https://cosmos.so/${username}`, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; MoodboardProxy/1.0)' },
      })

      if (!res.ok) {
        return Response.json({ error: 'Profile not found' }, {
          status: 404,
          headers: corsHeaders,
        })
      }

      const html = await res.text()
      const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)

      if (!match) {
        return Response.json({ error: 'Could not parse profile data' }, {
          status: 502,
          headers: corsHeaders,
        })
      }

      const nextData = JSON.parse(match[1])
      const apolloState = nextData.props?.pageProps?.initialApolloState

      if (!apolloState) {
        return Response.json({ error: 'No profile data found' }, {
          status: 404,
          headers: corsHeaders,
        })
      }

      return Response.json(apolloState, {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      })
    } catch (err) {
      return Response.json({ error: 'Failed to fetch profile' }, {
        status: 502,
        headers: corsHeaders,
      })
    }
  },
}
