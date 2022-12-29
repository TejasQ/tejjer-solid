import { authorize } from "../../util/oauth";

import Button from "./Button";
import Logo from "./Logo";

function LoginPage() {
  return (
    <div class="p-4 w-screen h-screen flex items-center justify-center flex-col gap-8 md:gap-16">
      <Logo size={256}></Logo>
      <div class="grid max-w-screen-md gap-4 mx-auto text-center">
        <h1 class="text-6xl font-bold">Tejjer</h1>
        <p class="text-xl">
          This application is a lightweight clone of Twitter with partial
          feature parity that exists to demonstrate various user interface
          features and performance. It is open source and used for learning.
        </p>
      </div>
      <div class="flex items-center gap-4">
        <Button
          onClick={() => {
            console.log("hi");
            authorize();
          }}
        >
          Login
        </Button>
        <Button
          color="secondary"
          onClick={(event) => window.open("github url @todo")}
        >
          Browse the Code
        </Button>
      </div>
    </div>
  );
}

export default LoginPage;
