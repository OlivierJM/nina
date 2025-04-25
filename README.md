```markdown
# nina

**nina** is a minimal static site generator powered by [Eta](https://eta.js.org/) templates and styled with [Pico.css](https://picocss.com/). It converts your Markdown files into clean, responsive HTML pages—perfect for just simple(e) blogs. This is not meant for documentation as there are many features that nina doesnt support.

My initial plan was to keep this dependency free but I didn't want to deal with styling individual elements and I also preferred to use eta to make it easy to customize templates. I plan to add support for external templates or themes. 

---

## ✨ Features

- 📝 Converts Markdown to HTML
- 🎨 Supports layout templates using Eta
- 📁 Auto-discovers nested content, we recursively build children directories
- 🚀 Builds a complete site with an index and individual post pages
- 🌐 Uses Pico.css for beautiful defaults
- 🗂️ Copies static assets to the final build

---

## 📁 Project Structure

nina/  
├── content/      # markdown articles   
├── public/       
├── templates/    # Eta templates check https://eta.js.org/docs  
│   ├── layouts/   
│   │   ├── layout.eta  # The main layout   
│   │   └── post.eta    # post layout   
│   └── partials/   
│       └── header.eta    
├── site.json     # Site config (title, author, baseUrl, etc.)   
├── dist/         # Auto-generated output folder (after we run build)   
├── index.js      
├── package.json   
└── README.md   

---

## ⚙️ Configuration

Create a `site.json` file in the root:

```json
{
  "title": "Blog",
  "description": "blog for my thoughts built with nina",
  "author": "John",
  "baseUrl": "/"
}
```

---

## 🚧 How to Use

1.  **Clone the repo**

> It is better if you first fork this repo 

    ```bash
    git clone [https://github.com/olivierjm/nina](https://github.com/olivierjm/nina)
    cd nina
    ```

2.  **Add content**

    Create Markdown files inside the `content/` directory. Use YAML front matter for metadata:

    ```markdown
    ---
    title: "First article"
    date: "2025-04-25"
    author: "JM" -- If this is not provided then global author from site.json will be used
    ---

    This is my first blog post!
    ```

3.  **Run the build script**

    ```bash
    node bin/index.js
    ```

    This will:

    - Parse markdown content
    - Render each post using `templates/layouts/post.eta`
    - Render the homepage using `templates/layouts/home.eta`
    - Output HTML files to the `dist/` directory

4.  **View your site**

    Open `dist/index.html` in a browser or serve it locally:

    ```bash
    npx serve dist
    ```
```