import "isomorphic-fetch";
import { NextApiHandler } from "next";
import cookie from "cookie"
import { APIEvent } from "solid-start";

import { getToken } from "../../../../../util/oauth";

export const GET = async ({ params, request }: APIEvent) => {
  const authCode = new URLSearchParams(request.url).get('code') as string;
  const redirectUri = "https://tejjer-solid.tej.as/api/auth/twitter/callback";

  try {
    const token = await getToken({ authCode, redirectUri });

    return new Response("{}", {
      status: 302, headers: {
        'Location': '/',
        'Set-Cookie': cookie.serialize(
          "token",
          JSON.stringify({
            value: token.access_token,
            expiresAt: new Date(Date.now() + token.expires_in * 1000),
          }),
          {
            httpOnly: true,
            maxAge: token.expires_in,
            path: "/",
          }
        )
      }
    })

  } catch (e) {
    return { error: e };
  }
};
