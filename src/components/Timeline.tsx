import { For } from "solid-js";

import { css } from "solid-styled-components";

import Avatar from "./Avatar";

function Timeline(props) {
  return (
    <div class="overflow-auto">
      <For each={props.timeline}>
        {(tweet, _index) => {
          const index = _index();
          return (
            <div>
              <div class="flex items-start gap-4 p-4 border-t border-gray-300 dark:border-gray-700">
                <div>
                  <Avatar
                    url={tweet.author.profile_image_url}
                    alt={tweet.author.name}
                    size={64}
                  ></Avatar>
                </div>
                <div class="grid w-full gap-2">
                  <div className="">
                    <div class="flex items-center gap-1">
                      <div>
                        <strong>{tweet.author.name}</strong>{" "}
                        <span class="text-gray-500">
                          @{tweet.author.username}·{" "}
                          {Intl.DateTimeFormat("en-US", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(tweet.created_at))}
                        </span>
                      </div>
                      <div class="ml-auto">...</div>
                    </div>
                  </div>
                  <p class="text-xl leading-normal">{tweet.text}</p>
                  <div>
                    <ul class="flex items-center justify-between w-full gap-2 mt-2">
                      <li>
                        <button
                          onClick={(event) => alert("Not yet implemented!")}
                        >
                          💬
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={(event) => alert("Not yet implemented!")}
                        >
                          ♻️
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={(event) => alert("Not yet implemented!")}
                        >
                          ❤️
                        </button>
                      </li>
                      <li>
                        <button
                          onClick={(event) => alert("Not yet implemented!")}
                        >
                          🚀
                        </button>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}

export default Timeline;
