export async function GET(): Promise<Response> {
    return new Response('Hello world.', {
        status: 200,
        headers: {
            'content-type': 'text/plain'
        }
    })
}
