const chokidar = require("chokidar");
const { exec } = require("child_process");

chokidar.watch(["content", "templates", "public"]).on("all", () => {
  exec("npm run build", (err) => {
    if (err) {
      console.error(`exec error: ${err}`);
      return;
    }
  });
});
