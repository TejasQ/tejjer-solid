import { parse } from "cookie";
import { A, RouteDataFunc, useRouteData } from "solid-start";
import { createServerData$ } from "solid-start/server";
import LoginPage from "~/components/LoginPage";
import WholeUI from "~/components/WholeUI";

export default function Home() {
  const read = useRouteData<typeof routeData>();
  const data = read();

  if (!data?.authenticated) {
    return <LoginPage />;
  }

  return <WholeUI me={data.me} timeline={data.timeline} token={data.token} />;
}

export const routeData: RouteDataFunc = () => {
  return createServerData$(
    async (_, { request }) => {
      const cookie = request.headers.get("Cookie") as string;

      if (!cookie) {
        return { authenticated: false };
      }

      let token;
      try {
        token = JSON.parse(decodeURIComponent(parse(cookie).token) || "{}");
      } catch {}

      if (!token) {
        return { authenticated: false };
      }

      const twitterRequestOptions = {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
      };

      const me = await fetch(
        "https://api.twitter.com/2/users/me?user.fields=profile_image_url",
        twitterRequestOptions
      )
        .then((r) => r.json())
        .then((r) => r.data);

      console.log({ me });

      if (!me) {
        return { authenticated: false };
      }

      const timeline = await fetch(
        `https://api.twitter.com/2/users/${me.id}/timelines/reverse_chronological?tweet.fields=created_at&expansions=author_id&user.fields=profile_image_url,id,username&max_results=100`,
        twitterRequestOptions
      )
        .then((r) => r.json())
        .then((r) =>
          r.data.map((tweet: any) => ({
            ...tweet,
            author: r.includes.users.find(
              (user: any) => user.id === tweet.author_id
            ),
          }))
        );

      return {
        authenticated: true,
        token: token.value,
        expiresAt: token.expiresAt,
        me,
        timeline,
      };
    },
    { key: "hi" }
  );
};
