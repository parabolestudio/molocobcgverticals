import { html, arc, scaleLinear } from "./lib.js";

const groupings = {
  "Acquisition strength": [
    {
      type: "low",
      min: 0,
      max: 6.9,
    },
    {
      type: "medium",
      min: 7,
      max: 8.5,
    },
    {
      type: "high",
      min: 8.6,
      max: 10,
    },
  ],
  "Sustained loyalty": [
    {
      type: "low",
      min: 0,
      max: 6.0,
    },
    {
      type: "medium",
      min: 6.1,
      max: 7.6,
    },
    {
      type: "high",
      min: 7.7,
      max: 10,
    },
  ],
  // TODO: check values for these groupings
  "Platform engagement depth": [
    {
      type: "low",
      min: 0,
      max: 6.9,
    },
    {
      type: "medium",
      min: 7,
      max: 8.5,
    },
    {
      type: "high",
      min: 8.6,
      max: 10,
    },
  ],
};

export function VisCustomerRelationships({ id, vertical, variable, data }) {
  console.log("CUSTOMER RELATIONSHIPS - Loaded data:", variable, data);

  if (!data) return html`<div>Loading data...</div>`;

  // vis dimensions
  const visContainer = document.querySelector(`#${id}`);
  const width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  const aspectRatio = 352 / 160; // width:height ratio
  const height = width / aspectRatio;
  const margin = { top: 0, right: 18, bottom: 0, left: 18 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const arcWidth = 30;

  const groups = groupings[variable];

  // angle scale
  const angleScale = scaleLinear().domain([0, 1]).range([0, Math.PI]);

  // loop over all groups and calculate arc attributes
  const arcs = groups.map((group) => {
    const startAngle = angleScale((group.min - 0) / 10);
    const endAngle = angleScale((group.max - 0) / 10);

    const arcGen = arc()
      .innerRadius(innerHeight - arcWidth)
      .outerRadius(innerHeight)
      .startAngle(startAngle)
      .endAngle(endAngle);

    return { type: group.type, arcGen };
  });

  return html`<div class="customer-relationships-container">
    <svg width="${width}" height="${height}">
      <g transform="translate(${margin.left}, ${margin.top})">
        <rect
          x="0"
          y="0"
          width="${innerWidth}"
          height="${innerHeight}"
          fill="transparent"
        />
        <line
          x1="${-margin.left}"
          y1="${innerHeight - 1}"
          x2="${0}"
          y2="${innerHeight - 1}"
          stroke-width="1.5"
          class="axis-line"
        />
        <line
          x1="${innerWidth}"
          y1="${innerHeight - 1}"
          x2="${innerWidth + margin.right}"
          y2="${innerHeight - 1}"
          stroke-width="1.5"
          class="axis-line"
        />
        <text x="${-margin.left}" y="${innerHeight - 5}" class="axis-text">
          0
        </text>
        <text
          x="${innerWidth + margin.right}"
          y="${innerHeight - 5}"
          text-anchor="end"
          class="axis-text"
        >
          10
        </text>
        <text
          x="${innerWidth / 2}"
          y="${innerHeight - 5}"
          text-anchor="middle"
          class="ban"
        >
          ${data}
        </text>
        <g class="arcs">
          ${arcs.map(({ type, arcGen }) => {
            let fill;
            if (type === "low") fill = "#0280FB";
            else if (type === "medium") fill = "#D9D9D9";
            else if (type === "high") fill = "#60E2B7";
            return html`<path
              d="${arcGen()}"
              fill="${fill}"
              transform="${`translate(${innerWidth / 2}, ${innerHeight}) rotate(-90)`}"
            />`;
          })}
        </g>
      </g>
    </svg>
  </div>`;
}
