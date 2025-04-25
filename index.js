/**
 * In this file we will build all markdown files
 * extract data from markdown
 * Render this data to html layout
 * output the files in a build directory
 */

import fs from "fs-extra";
import matter from "gray-matter";
import { parse } from "marked";
import * as eta from "eta"
import path from 'node:path'

const contentDirectory = path.join(import.meta.dirname, "content");
const buildDirectory = path.join(import.meta.dirname, "dist");
const publicDirectory = path.join(import.meta.dirname, "public");


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

const et = new eta.Eta({ views: path.join(import.meta.dirname, "templates") })

async function build() {
  // clean the build ==> dist
  await fs.remove(buildDirectory);
  await fs.mkdirp(buildDirectory);

  await fs.copy(publicDirectory, buildDirectory);

  const contentFiles = await getMarkdownFiles(contentDirectory);

  const siteConfig = await fs.readJson(path.join(import.meta.dirname, "site.json"));

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
    const outputDir = path.join(buildDirectory, relativePath)
      .replace(/\.md$/, "");

    const outputFilename = path.join(outputDir, "index.html");

    await fs.ensureDir(path.dirname(outputFilename));

    posts.push({
      title: data.title || "No title",
      date: data.date || "No date",
      filename: path.relative(buildDirectory, outputFilename),
    });
    const htmlContent = parse(content);


    const commonTags = {
      title: data.title || siteConfig.title,
      siteTitle: siteConfig.title,
      description: siteConfig.description,
      year: new Date().getFullYear(),
      username: siteConfig.username,
      author: data.author || siteConfig.author,
      baseUrl: siteConfig.baseUrl || "/",
      date: new Date(data.date).toDateString(),
    }

    const tags = {
      content: htmlContent,
      backLink: `<p><a href="${
        siteConfig.baseUrl || "/"
      }">← Back to home</a></p>`,
    };

    const finalHtml = et.render("post", {
      ...tags,
      ...commonTags,
      content: htmlContent,
    });

    await fs.writeFile(outputFilename, finalHtml, "utf-8");

    const indexTags = {
      posts,
      backLink: "",
    };

    const indexHtml = et.render("layout", {...indexTags, ...commonTags});

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
