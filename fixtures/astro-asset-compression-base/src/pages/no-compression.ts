export async function GET(): Promise<Response> {
    return new Response('Hello world.'.repeat(1000), {
        status: 200,
        headers: {
            'content-type': 'text/plain'
        }
    })
}
