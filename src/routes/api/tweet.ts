import { APIEvent, json } from "solid-start";
import cookie from "cookie";

async function streamToString(stream: ReadableStreamDefaultReader<Uint8Array>) {
    const chunks = [];
    let isDone = false;

    while (!isDone) {
        const result = await stream.read()
        isDone = result.done
        if (result.value) chunks.push(Buffer.from(result.value));
    }

    return Buffer.concat(chunks).toString('utf-8')
}

export const POST = async ({ params, request, env }: APIEvent) => {
    const reader = request.body!.getReader();
    const { text } = JSON.parse(await streamToString(reader));

    const twitterRes = await fetch("https://api.twitter.com/2/tweets", {
        method: "POST",
        headers: {
            Authorization: `Bearer ${JSON.parse(decodeURIComponent(cookie.parse(request.headers.get('cookie')!).token)).value}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text,
        }),
    }).then(r => r.json())

    return json(twitterRes);
}