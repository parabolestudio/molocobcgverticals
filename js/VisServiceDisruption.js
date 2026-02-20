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

  const height = 80;
  const width = 250;
  const margin = { top: 5, right: 5, bottom: 5, left: 5 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const circleDiameter = 40;

  return html`<div class="service-disruption-container">
    <span class="service-disruption-number">${data}</span>
    <svg width="${width}" height="${height}" style="background: #f2f2f2;">
      <g transform="translate(${margin.left}, ${margin.top})">
        <circle
          cx="100"
          cy="${innerHeight / 2 + circleDiameter / 2}"
          r="${circleDiameter / 2}"
          fill="#D9D9D9"
        />
      </g>
    </svg>
  </div>`;
}
