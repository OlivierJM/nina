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

function applyTemplate(template, vars) {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return key in vars ? vars[key] : "";
  });
}


async function build() {
  // clean the build ==> dist
  await fs.remove(buildDirectory);
  await fs.mkdirp(buildDirectory);

  await fs.copy(publicDirectory, buildDirectory);

  const layout = await fs.readFile(layoutDirectory, "utf-8");

  const contentFiles = await getMarkdownFiles(contentDirectory);

  const siteConfig = await fs.readJson(path.join(__dirname, "site.json"));

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
    const outputDir = path
      .join(buildDirectory, relativePath)
      .replace(/\.md$/, "");

    const outputFilename = path.join(outputDir, "index.html");

    await fs.ensureDir(path.dirname(outputFilename));

    posts.push({
      title: data.title || "No title",
      date: data.date || "No date",
      filename: path.relative(buildDirectory, outputFilename),
    });
    const htmlContent = marked.parse(content);


    const tags = {
      title: data.title || siteConfig.title,
      content: htmlContent,
      date: new Date(data.date).toDateString(),
      siteTitle: siteConfig.title,
      description: siteConfig.description,
      author: data.author || siteConfig.author ,
      year: new Date().getFullYear(),

    }
    const finalHtml = applyTemplate(layout, tags);
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
      <ul>${postsList}</ul>
    `;

    console.log(siteConfig)

    const indexTags = {
      siteTitle: siteConfig.title,
      description: siteConfig.description,
      author: siteConfig.author ,
      year: new Date().getFullYear(),
      content: indexContent,
      baseUrl: siteConfig.baseUrl || "/"
    }
    const indexHtml = applyTemplate(layout, indexTags);


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
