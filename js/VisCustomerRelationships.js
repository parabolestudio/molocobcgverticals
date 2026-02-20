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

// TODO: replace with actual average value for the vertical
const averageValues = {
  "Acquisition strength": 7.25,
  "Sustained loyalty": 6.75,
  "Platform engagement depth": 7.5,
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

  const arcGradientOffset = 0.5;
  // Compute gradient for low arc
  const lowGroup = groups.find((g) => g.type === "low");
  const lowEndAngle = angleScale((lowGroup.max + arcGradientOffset) / 10);
  const gradientRadius = innerHeight - arcWidth / 2;
  const lowGradientId = `lowGradient-${id}`;

  // Compute gradient for high arc
  const highGroup = groups.find((g) => g.type === "high");
  const highStartAngle = angleScale((highGroup.min - arcGradientOffset) / 10);
  const highGradientId = `highGradient-${id}`;

  // calculate data arc attributes (for line and circle)
  const dataAngle = angleScale((data - 0) / 10);
  const dataElement = {
    arc: arc()
      .innerRadius(innerHeight - arcWidth / 2)
      .outerRadius(innerHeight - arcWidth / 2)
      .startAngle(0)
      .endAngle(dataAngle),
    circlePosition: {
      x: (innerHeight - arcWidth / 2) * Math.cos(dataAngle - Math.PI / 2),
      y: (innerHeight - arcWidth / 2) * Math.sin(dataAngle - Math.PI / 2),
    },
  };

  // calculate average line
  const averageValue = averageValues[variable];
  const averageAngle = angleScale((averageValue - 0) / 10);
  const averageLineMargin = 12;
  const averageElement = {
    lineStart: {
      x:
        (innerHeight - arcWidth - averageLineMargin) *
        Math.cos(averageAngle - Math.PI / 2),
      y:
        (innerHeight - arcWidth - averageLineMargin) *
        Math.sin(averageAngle - Math.PI / 2),
    },
    lineEnd: {
      x:
        (innerHeight + averageLineMargin) *
        Math.cos(averageAngle - Math.PI / 2),
      y:
        (innerHeight + averageLineMargin) *
        Math.sin(averageAngle - Math.PI / 2),
    },
  };

  return html`<div class="customer-relationships-container">
    <svg width="${width}" height="${height}">
      <defs>
        <linearGradient
          id="${lowGradientId}"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="${-gradientRadius}"
          x2="${gradientRadius * Math.sin(lowEndAngle)}"
          y2="${-gradientRadius * Math.cos(lowEndAngle)}"
        >
          <stop offset="0%" stop-color="#0280FB" />
          <stop offset="100%" stop-color="#DBDBDB" />
        </linearGradient>
        <linearGradient
          id="${highGradientId}"
          gradientUnits="userSpaceOnUse"
          x1="${gradientRadius * Math.sin(highStartAngle)}"
          y1="${-gradientRadius * Math.cos(highStartAngle)}"
          x2="0"
          y2="${gradientRadius}"
        >
          <stop offset="0%" stop-color="#DBDBDB" />
          <stop offset="100%" stop-color="#60E2B7" />
        </linearGradient>
      </defs>
      <g transform="translate(${margin.left}, ${margin.top})">
        <g class="periphery-elements">
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
        </g>
        <g class="arcs">
          ${arcs.map(({ type, arcGen }) => {
            let fill;
            if (type === "low") fill = `url(#${lowGradientId})`;
            else if (type === "medium") fill = "#D9D9D9";
            else if (type === "high") fill = `url(#${highGradientId})`;
            return html`<path
              d="${arcGen()}"
              fill="${fill}"
              transform="${`translate(${innerWidth / 2}, ${innerHeight}) rotate(-90)`}"
            />`;
          })}
        </g>
        <g class="average-elements">
          <line
            x1="${averageElement.lineStart.x}"
            y1="${averageElement.lineStart.y}"
            x2="${averageElement.lineEnd.x}"
            y2="${averageElement.lineEnd.y}"
            stroke="#04033A"
            stroke-opacity="0.4"
            stroke-width="1.5"
            transform="${`translate(${innerWidth / 2}, ${innerHeight}) rotate(-90)`}"
          />
          <g
            transform="${`translate(${innerWidth / 2}, ${innerHeight}) rotate(-90)`}"
          >
            <text
              x="${averageElement.lineEnd.x + 10}"
              y="${averageElement.lineEnd.y + 2}"
              dominant-baseline="middle"
              class="average-label"
              transform="${`rotate(90)`}"
              transform-origin="${averageElement.lineEnd.x +
              10} ${averageElement.lineEnd.y + 2}"
            >
              avg
            </text>
          </g>
        </g>
        <g class="data-elements">
          <path
            d="${dataElement.arc()}"
            fill="#04033A"
            transform="${`translate(${innerWidth / 2}, ${innerHeight}) rotate(-90)`}"
            stroke="#04033A"
            stroke-width="3"
          />
          <circle
            cx="${dataElement.circlePosition.x}"
            cy="${dataElement.circlePosition.y}"
            r="6"
            fill="#04033A"
            transform="${`translate(${innerWidth / 2}, ${innerHeight})  rotate(-90)`}"
          />
        </g>
      </g>
    </svg>
  </div>`;
}
