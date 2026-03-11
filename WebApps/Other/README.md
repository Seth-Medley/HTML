# Miscellaneous Web Applications

This directory serves as a repository for utility tools, experiments, and reusable boilerplates that support the broader development of this repository. 

## 📂 Project Directory

| Project | Purpose | Key Technical Feature |
| :--- | :--- | :--- |
| **[Video Player](./Video%20Player/)** | Custom media interface | Dark Mode responsive CSS (`prefers-color-scheme`). |
| **[HTML Template](./HTML%20Template/)** | Project starter kit | Highly organized CSS root variables and layout scaffolding. |

---

## 🛠️ Individual Project Details

### 🎥 Video Player
A standalone, custom-designed video player. Unlike standard browser players, this was built to demonstrate control over media UI and theme responsiveness.
* **Significant Logic**: Uses a centralized `function.js` to manage playback state.
* **Styling**: Implements a modular CSS approach where layout and theme are separated.

### 📄 HTML Template
This is the "Golden Standard" template used to initialize new WebApps in this repo.
* **Why it exists**: To ensure that every project starts with a consistent reset, font-stack, and directory structure (`CSS/`, `JS/`, `IMG/`).
* **Lines of Code**: ~50 lines of optimized boilerplate designed for rapid prototyping.

---

## 🚀 Usage
These projects are intended to be used as standalone modules or integrated into larger applications. To use the template:
1. Copy the `HTML Template` folder.
2. Rename it to your new project name.
3. Start coding in `index.html`.

## 📈 Evolution Note
Items in this folder are often the testing grounds for features that eventually move into "Stable" releases like the **HTML Editor v1.5**.