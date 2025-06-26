import { createServerClient } from '@supabase/ssr'

export async function createClient(request: Request, responseHeaders: Headers) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      request,
      response: {
        headers: responseHeaders,
      },
    }
  )
}
