import { watch } from "chokidar";
import { exec } from "child_process";

watch(["content", "templates", "public"]).on("all", () => {
  exec("npm run build", (err) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
  });
});
