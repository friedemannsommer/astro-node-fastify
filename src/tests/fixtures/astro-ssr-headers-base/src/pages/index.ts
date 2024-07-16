import type { APIContext } from 'astro'

export async function GET(context: APIContext): Promise<Response> {
    return new Response('Hello world.', {
        status: 200,
        headers: {
            'content-type': 'text/plain',
            'x-param': context.url.searchParams.get('header') ?? 'n/a'
        }
    })
}
