import { h, render } from "https://esm.sh/preact";
import htm from "https://esm.sh/htm";
import { useState, useEffect, useRef } from "https://esm.sh/preact/hooks";
import { csv } from "https://esm.sh/d3-fetch";

function renderVis(vis) {
  const containerElement = document.getElementById(vis.id);
  if (containerElement) {
    // clear existing content before rendering
    containerElement.innerHTML = "";

    // wait for async Vis to resolve before rendering
    (async () => {
      // const rendered = await Vis(vis);
      renderComponent(html`<${vis.component} ...${vis} />`, containerElement);
    })();
  } else {
    console.error(`Could not find container element for vis with id ${vis.id}`);
  }
}

export const html = htm.bind(h);
export const renderComponent = render;
export { useState, useEffect, useRef, csv, renderVis };
