import "@logseq/libs";
import React from "react";
import * as ReactDOM from "react-dom/client";
import Parser from "rss-parser";

import App from "./App";
import { logseq as PL } from "../package.json";

import "./index.css";

const pluginId = PL.id;

async function main() {
  console.info(`#${pluginId}: MAIN`);
  const parser = new Parser();
  const res = await fetch("https://www.reddit.com/.rss", {
    method: "GET",
    mode: "cors",
  }).then((res) => res.text());
  console.log("res", res);
  if (!res) return;
  const feed = await parser.parseString(res);
  console.log("feed", feed);

  const root = ReactDOM.createRoot(document.getElementById("app")!);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

logseq.ready(main).catch(console.error);
