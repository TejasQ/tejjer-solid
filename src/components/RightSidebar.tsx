import { For } from "solid-js";

import { css } from "solid-styled-components";

import Avatar from "./Avatar";
import Button from "./Button";
import SectionHeading from "./SectionHeading";
export const peopleToFollow = [
  {
    name: "Tejas Kumar",
    handle: "@tejaskumar_",
    profile_image_url: "https://github.com/tejasq.png",
  },
];

function RightSidebar(props) {
  return (
    <div>
      <div class="sticky top-0 grid content-start max-h-screen gap-4 py-4 overflow-auto">
        <div>
          <input
            class="w-full px-4 py-2 text-white bg-gray-200 dark:bg-gray-700 rounded-3xl"
            type="text"
            placeholder="Search Twitter"
            onClick={(event) => alert("Not yet implemented!")}
          />
        </div>
        <div class="grid gap-4 p-4 border border-gray-300 dark:border-0 dark:bg-gray-800 rounded-3xl">
          <SectionHeading>What is this?</SectionHeading>
          <p>
            This is an open-source application that makes basic usage of
            Twitter, and is intended to be used for teaching and experimenting
            for people interested in open source.
          </p>
        </div>
        <div class="grid gap-4 p-4 border border-gray-300 dark:border-0 dark:bg-gray-800 rounded-3xl">
          <SectionHeading>Who to follow</SectionHeading>
          <ul class="grid gap-2">
            <For each={peopleToFollow}>
              {(person, _index) => {
                const index = _index();
                return (
                  <li class="w-full">
                    <div class="flex items-center w-full gap-4">
                      <div>
                        <Avatar
                          url={person.profile_image_url}
                          alt={person.name}
                        ></Avatar>
                      </div>
                      <div class="grid gap-1 leading-none">
                        <div>
                          <span class="font-bold">{person.name}</span>
                        </div>
                        <div>
                          <span class="text-xs">{person.handle}</span>
                        </div>
                      </div>
                      <div class="ml-auto">
                        <Button
                          onClick={(event) => alert("Not yet implemented")}
                          condensed={true}
                        >
                          Follow
                        </Button>
                      </div>
                    </div>
                  </li>
                );
              }}
            </For>
          </ul>
        </div>
        <div class="p-4 text-sm">
          <ul class="list-disc dark:text-sky-200 text-sky-600">
            <li>
              <a href="#">Watch the video on YouTube</a>
            </li>
            <li>
              <a href="#">View the Source Code on GitHub</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default RightSidebar;
