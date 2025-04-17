/**
 * In this file we will build all markdown files
 * extract data from markdown
 * Render this data to html layout
 * output the files in a build directory
 */

const fs = require("fs-extra");
const path = require("path");
const matter = require("gray-matter");
const marked = require("marked");

const contentDirectory = path.join(__dirname, "content");
const buildDirectory = path.join(__dirname, "dist");
const layoutDirectory = path.join(__dirname, "templates", "layout.html");
const publicDirectory = path.join(__dirname, "public");

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

async function build() {
  // clean the build ==> dist
  await fs.remove(buildDirectory);
  await fs.mkdirp(buildDirectory);

  await fs.copy(publicDirectory, buildDirectory);

  const layout = await fs.readFile(layoutDirectory, "utf-8");

  const contentFiles = await getMarkdownFiles(contentDirectory);

  const posts = [];
  for (const file of contentFiles) {
    // if (path.extname(file) !== ".md") {
    //   continue;
    // }
    // const filePath = path.join(contentDirectory, file);
    const rawFile = await fs.readFile(file, "utf-8");
    const { data, content } = matter(rawFile);
    
    const relativePath = path.relative(contentDirectory, file);
    // we keep the same file name as the markdown but we rename it to html
    const outputFilename = path
    .join(buildDirectory, relativePath)
    .replace(/\.md$/, ".html");
    
    await fs.ensureDir(path.dirname(outputFilename));
    
    console.log(outputFilename)
    posts.push({
      title: data.title || "No title",
      date: data.date || "No date",
      filename: path.relative(buildDirectory, outputFilename),
    });
    const htmlContent = marked.parse(content);
    const finalHtml = layout
      .replace("{{ content }}", htmlContent)
      .replace("{{ title }}", data.title)
      .replace("{{ date }}", new Date(data.date).toDateString());

    // const outputPath = path.join(buildDirectory, outputFilename);

    console.log("==================")
    console.log(outputFilename)
    console.log("==================")
    await fs.writeFile(outputFilename, finalHtml, "utf-8");

    // Build the list for all posts from content directory

    const postsList = posts
      .map(
        (post) =>
          `<li><a href="${post.filename}">${post.title}</a> - <small>${new Date(
            post.date
          ).toLocaleDateString()}</small></li>`
      )
      .join("\n");

    const indexContent = `
      <h1>Blog Posts</h1>
      <ul>${postsList}</ul>
    `;
    const indexHtml = layout
      .replace("{{ content }}", indexContent)
      .replace("{{ title }}", "Blog Posts")
      .replace("{{ date }}", new Date().toDateString());

    await fs.writeFile(outputFilename, finalHtml, "utf-8");
    await fs.writeFile(
      path.join(buildDirectory, "index.html"),
      indexHtml,
      "utf-8"
    );
    console.log(`Successfully built ${outputFilename}`);
  }
}

build().catch(console.error);
