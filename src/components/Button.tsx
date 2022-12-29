import { css } from "solid-styled-components";

import clsx from "clsx";

function Button(props) {
  return (
    <button
      class={clsx(
        props.fullWidth && "w-full justify-center ",
        props.color === "secondary"
          ? "text-white bg-gray-600"
          : "dark:text-black dark:bg-white dark:hover:bg-white bg-sky-600 hover:bg-sky-500 text-white",
        !props.condensed ? "text-lg" : "text-sm",
        "flex items-center font-bold px-4 py-2 rounded-3xl"
      )}
      onClick={(event) => props.onClick()}
    >
      {props.children}
    </button>
  );
}

export default Button;
