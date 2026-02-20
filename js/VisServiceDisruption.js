import { html, scaleThreshold, scalePoint } from "./lib.js";

// TODO: replace with actual average values
const averageValues = {
  Disintermediation: 7,
  "Data standardization": 6,
  "Regulatory shield": 4,
};

export function VisServiceDisruption({ variable, data, isMobile }) {
  console.log("SERVICE DISRUPTION - Loaded data:", variable, data, isMobile);

  if (!data) return html`<div>Loading data...</div>`;

  if (variable === "Overall score") {
    return html`<span>${data}</span>`;
  }
  if (variable === "Disruption value") {
    return html`<span>${data} disruption</span>`;
  }

  const circleDiameter = isMobile ? 35 : 40;
  const circleGap = isMobile ? 10 : 15;
  // TODO: use calculated dimensions for desktop + adjust for mobile to account for the avg element (as soon as real avg values provided)
  // on mobile, avg might be above or below circles (<5, >5)
  // how to place when not rounded? in between circles?
  const height = isMobile ? circleDiameter * 2 + circleGap : 70;
  const width = isMobile ? circleDiameter * 5 + 4 * circleGap : 495;
  const margin = { top: 0, right: 5, bottom: 0, left: 5 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

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

  const scaleXDesktop = scalePoint()
    .domain([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    .range([0, innerWidth - circleDiameter]);
  const scaleXMobile = scalePoint()
    .domain([1, 2, 3, 4, 5])
    .range([0, innerWidth - circleDiameter]);

  const scaleYMobile = scaleThreshold()
    .domain([6, 10])
    .range([circleDiameter / 2, innerHeight - circleDiameter / 2]);

  const avgValue = averageValues[variable];

  return html`<div class="service-disruption-container">
    <span class="service-disruption-number">${data}</span>
    <svg width="${width}" height="${height}">
      <g transform="translate(${margin.left}, ${margin.top})">
        ${isMobile
          ? null
          : html` <g
              class="average-elements"
              transform="translate(${scaleXDesktop(avgValue) +
              circleDiameter / 2}, 20)"
            >
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
            </g>`}
        ${Array.from({ length: 10 }, (_, i) => {
          const type = i < data ? "active" : "inactive";
          const color =
            type === "active"
              ? colorMapping[disruptionScale(data)]
              : "transparent";
          const cx = isMobile
            ? scaleXMobile(i + 1 <= 5 ? i + 1 : i + 1 - 5) + circleDiameter / 2
            : scaleXDesktop(i + 1) + circleDiameter / 2;
          const cy = isMobile
            ? scaleYMobile(i + 1)
            : innerHeight / 2 + circleDiameter / 2 - 8;

          return html`<circle
            cx="${cx}"
            cy="${cy}"
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
