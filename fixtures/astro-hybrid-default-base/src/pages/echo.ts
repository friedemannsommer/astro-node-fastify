import type { APIContext } from 'astro'

export const prerender = false

export async function POST(context: APIContext): Promise<Response> {
    return new Response(context.request.body, {
        status: 200,
        headers: {
            'content-type': context.request.headers.get('content-type') || 'application/octet-stream'
        }
    })
}
