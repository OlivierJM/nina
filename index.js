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

async function build() {
  // clean the build ==> dist
  await fs.remove(buildDirectory);
  await fs.mkdirp(buildDirectory);

  await fs.copy(publicDirectory, buildDirectory);

  const layout = await fs.readFile(layoutDirectory, "utf-8");

  const contentFiles = await fs.readdir(contentDirectory);

  const posts = [];
  for (const file of contentFiles) {
    if (path.extname(file) !== ".md") {
      continue;
    }
    const filePath = path.join(contentDirectory, file);
    const rawFile = await fs.readFile(filePath, "utf-8");
    const { data, content } = matter(rawFile);

    const outputFilename = file.replace(".md", ".html"); // we keep the same file name as the markdown but we rename it to html

    posts.push({
      title: data.title || "No title",
      date: data.date || "No date",
      filename: outputFilename,
    });
    const htmlContent = marked.parse(content);
    const finalHtml = layout
      .replace("{{ content }}", htmlContent)
      .replace("{{ title }}", data.title)
      .replace("{{ date }}", new Date(data.date).toDateString());

    const outputPath = path.join(buildDirectory, outputFilename);

    // Build the list for all posts from content directory

    const postsList = posts
      .map(
        (post) =>
          `<li><a href="${post.filename}">${post.title}</a> - <small>${new Date(post.date).toLocaleDateString()}</small></li>`
      )
      .join("\n");

    const indexContent = `
      <h1>Blog Posts</h1>
      <ul>${postsList}</ul>
    `
    const indexHtml = layout.replace("{{ content }}", indexContent).replace("{{ title }}", "Blog Posts").replace("{{ date }}", new Date().toDateString());

    await fs.writeFile(outputPath, finalHtml, "utf-8");
    await fs.writeFile(path.join(buildDirectory, "index.html"), indexHtml, "utf-8");
    console.log(`Successfully built ${outputPath}`);
  }
}

build().catch(console.error);
