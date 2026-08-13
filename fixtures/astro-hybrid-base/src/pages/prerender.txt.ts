export const prerender = true

export async function GET(): Promise<Response> {
    return new Response('Hello World!', {
        status: 200,
        headers: {
            'content-type': 'text/plain; charset=utf-8'
        }
    })
}
