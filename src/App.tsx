import React, { useRef } from "react";
import { useAppVisible } from "./utils";

function App() {
  const innerRef = useRef<HTMLDivElement>(null);
  const visible = useAppVisible();
  if (visible) {
    return (
      <main
        className="logseq-rss-reader-plugin-main"
        onClick={(e) => {
          if (!innerRef.current?.contains(e.target as any)) {
            window.logseq.hideMainUI();
          }
        }}
      >
        <div ref={innerRef} className="text-size-2em">
          Welcome to [[Logseq]] Plugins!
        </div>
      </main>
    );
  }
  return null;
}

export default App;
