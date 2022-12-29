import { css } from "solid-styled-components";

import Avatar from "./Avatar";
import Button from "./Button";
import Logo from "./Logo";
import MenuItem from "./MenuItem";

function Sidebar(props) {
  return (
    <div class="relative">
      <div class="flex-col hidden h-screen overflow-auto md:flex md:top-0 md:fixed">
        <div class="px-4 py-8">
          <Logo></Logo>
        </div>
        <nav>
          <ul>
            <li>
              <MenuItem>
                <button
                  class="w-full text-left"
                  onClick={(event) => alert("Not yet implemented!")}
                >
                  Home
                </button>
              </MenuItem>
            </li>
            <li>
              <MenuItem>
                <button
                  class="w-full text-left"
                  onClick={(event) => alert("Not yet implemented!")}
                >
                  Explore
                </button>
              </MenuItem>
            </li>
            <li>
              <MenuItem>
                <button
                  class="w-full text-left"
                  onClick={(event) => alert("Not yet implemented!")}
                >
                  Communities
                </button>
              </MenuItem>
            </li>
            <li>
              <MenuItem>
                <button
                  class="w-full text-left"
                  onClick={(event) => alert("Not yet implemented!")}
                >
                  Notifications
                </button>
              </MenuItem>
            </li>
            <li>
              <MenuItem>
                <button
                  class="w-full text-left"
                  onClick={(event) => alert("Not yet implemented!")}
                >
                  Messages
                </button>
              </MenuItem>
            </li>
            <li>
              <MenuItem>
                <button
                  class="w-full text-left"
                  onClick={(event) => alert("Not yet implemented!")}
                >
                  Bookmarks
                </button>
              </MenuItem>
            </li>
            <li>
              <MenuItem>
                <button
                  class="w-full text-left"
                  onClick={(event) => alert("Not yet implemented!")}
                >
                  Profile
                </button>
              </MenuItem>
            </li>
            <li>
              <MenuItem>
                <button
                  class="w-full text-left"
                  onClick={(event) => alert("Not yet implemented!")}
                >
                  More
                </button>
              </MenuItem>
            </li>
            <li>
              <div class="p-4">
                <Button
                  onClick={(event) =>
                    document.querySelector("#composer").focus()
                  }
                  fullWidth={true}
                >
                  Tweet
                </Button>
              </div>
            </li>
          </ul>
        </nav>
        <div class="flex items-center w-full gap-4 p-4 mt-auto text-sm">
          <div>
            <Avatar
              alt={props.me.name}
              url={props.me.profile_image_url}
            ></Avatar>
          </div>
          <div>
            <div class="font-bold">{props.me.name}</div>
            <div class="text-gray-400">@{props.me.username}</div>
          </div>
          <div class="ml-auto">...</div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
