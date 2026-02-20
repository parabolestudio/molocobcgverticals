import { html, useEffect, useState } from "./lib.js";

export function VisServiceDisruption({ vertical, variable, data }) {
  console.log("SERVICE DISRUPTION - Loaded data:", variable, data);

  if (!data) return html`<div>Loading data...</div>`;

  return html`<div>
    Coded Service Disruption Visualization for ${vertical} and ${" "}
    ${variable}
  </div>`;
}
