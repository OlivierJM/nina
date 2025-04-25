const fs = require("fs-extra");
const path = require("path");


async function getMarkdownFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  let files = [];
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      const nestedFiles = await getMarkdownFiles(filePath);
      files = files.concat(nestedFiles);
    }

    // handle when the entry is a file, meaning we've reached the end of the tree
    else if (entry.isFile() && path.extname(entry.name) === ".md") {
      files.push(filePath);
    }
  }
  return files;
}
exports.getMarkdownFiles = getMarkdownFiles;
