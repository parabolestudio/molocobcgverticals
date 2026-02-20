import { html, useEffect, useState } from "./lib.js";

export function VisServiceDisruption({ vertical, variable, data }) {
  console.log("SERVICE DISRUPTION - Loaded data:", variable, data);

  if (!data) return html`<div>Loading data...</div>`;

  if (variable === "Overall score") {
    return html`<span>${data}</span>`;
  }
  if (variable === "Disruption value") {
    return html`<span>${data} disruption</span>`;
  }

  return html`<div>
    Coded Service Disruption Visualization for ${vertical} and ${" "}
    ${variable}
  </div>`;
}
