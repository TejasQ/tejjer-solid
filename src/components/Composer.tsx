import { createSignal } from "solid-js";

import { css } from "solid-styled-components";

import Avatar from "./Avatar";
import Button from "./Button";
export const postTweet = async ({
  text,
  token,
}: {
  text: string;
  token: string;
}) => {
  return await fetch("/api/tweet", {
    method: "POST",
    body: JSON.stringify({
      text,
    }),
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((r) => r.json())
    .then(() => alert("Done!"));
};

function Composer(props) {
  const [tweet, setTweet] = createSignal("");

  return (
    <>
      <div>
        <div class="flex items-center gap-4 p-4">
          <div>
            <Avatar
              alt={props.me.name}
              url={props.me.profile_image_url}
              size={64}
            ></Avatar>
          </div>
          <div class="w-full">
            <textarea
              class="w-full p-4 text-xl border border-gray-300 rounded dark:border-0 dark:text-white dark:bg-black"
              id="composer"
              placeholder="What's happening?"
              value={tweet()}
              onChange={(event) => setTweet(event.target.value)}
            ></textarea>
          </div>
        </div>
        <div class="grid p-4 grid-cols-[1fr,auto]">
          <ul class="flex items-center gap-4">
            <li>
              <button onClick={(event) => alert("Not yet implemented!")}>
                📸
              </button>
            </li>
            <li>
              <button onClick={(event) => alert("Not yet implemented!")}>
                📊
              </button>
            </li>
            <li>
              <button onClick={(event) => alert("Not yet implemented!")}>
                😄
              </button>
            </li>
            <li>
              <button onClick={(event) => alert("Not yet implemented!")}>
                🕙
              </button>
            </li>
            <li>
              <button onClick={(event) => alert("Not yet implemented!")}>
                📍
              </button>
            </li>
          </ul>
          <div>
            <Button
              condensed={true}
              onClick={(event) => {
                postTweet({
                  text: tweet(),
                  token: props.token,
                });
              }}
            >
              Tweet
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Composer;
