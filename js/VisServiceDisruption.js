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

  const height = 75;
  const width = 250;

  return html`<div class="service-disruption-container">
    <span class="service-disruption-number">${data}</span>
    <svg width="${width}" height="${height}" style="background: #f2f2f2;"></svg>
  </div>`;
}
