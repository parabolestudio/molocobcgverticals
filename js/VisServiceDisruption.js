import {
  html,
  useEffect,
  useState,
  scaleThreshold,
  scalePoint,
} from "./lib.js";

export function VisServiceDisruption({ vertical, variable, data }) {
  console.log("SERVICE DISRUPTION - Loaded data:", variable, data);

  if (!data) return html`<div>Loading data...</div>`;

  if (variable === "Overall score") {
    return html`<span>${data}</span>`;
  }
  if (variable === "Disruption value") {
    return html`<span>${data} disruption</span>`;
  }

  const height = 70;
  const width = 495;
  const margin = { top: 0, right: 5, bottom: 0, left: 5 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const circleDiameter = 40;

  const disruptionScale = scaleThreshold()
    .domain([2.001, 4.001, 6.001, 8.001, 10.001])
    .range(["Very Low", "Low", "Moderate", "High", "Very High"]);

  console.log(
    "SERVICE DISRUPTION - Disruption scale value:",
    disruptionScale(8),
  );

  const colorMapping = {
    "Very Low": "#1AA476",
    Low: "#60E2B7",
    Moderate: "#D9D9D9",
    High: "#B7A6FF",
    "Very High": "#7659EE",
  };

  const scaleX = scalePoint()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .range([0, innerWidth - circleDiameter]);

  const avgValue = 8;

  return html`<div class="service-disruption-container">
    <span class="service-disruption-number">${data}</span>
    <svg width="${width}" height="${height}" style="margin-top: 3px">
      <g transform="translate(${margin.left}, ${margin.top})">
        <g transform="translate(${scaleX(avgValue) + circleDiameter / 2}, 20)">
          <text
            class="avg-text"
            dy="-10"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            avg.
          </text>
          <line
            y1="0"
            y2="${innerHeight / 2 + circleDiameter / 2 - 26}"
            stroke="var(--Black, #04033A)"
            stroke-width="0.5"
          />
        </g>
        ${Array.from({ length: 10 }, (_, i) => {
          const type = i < data ? "active" : "inactive";
          const color =
            type === "active"
              ? colorMapping[disruptionScale(data)]
              : "transparent";

          return html`<circle
            cx="${scaleX(i + 1) + circleDiameter / 2}"
            cy="${innerHeight / 2 + circleDiameter / 2 - 8}"
            r="${circleDiameter / 2}"
            fill="${color}"
            stroke="${type === "active" ? "none" : "#00000075"}"
            stroke-dasharray="${type === "active" ? "none" : "4 2"}"
          />`;
        })}
      </g>
    </svg>
  </div>`;
}
