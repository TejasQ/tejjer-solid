import { css } from "solid-styled-components";

function Avatar(props) {
  return (
    <img
      class="rounded-full"
      width={props.size || 40}
      alt={props.alt}
      src={props.url}
    />
  );
}

export default Avatar;
