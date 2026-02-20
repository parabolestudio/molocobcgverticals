import { html, csv, useEffect, useState } from "./lib.js";
import { REPO_URL } from "./helpers.js";

export function VisCustomerRelationships({ id, vertical, variable }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    csv(`${REPO_URL}/data/data_customer_relationships.csv`).then((rawData) => {
      if (vertical) {
        const filteredData = rawData.filter((d) => d.Vertical === vertical);
        if (filteredData.length > 0) {
          const verticalData = filteredData[0];

          // select variable-specific data if variable is provided
          if (variable && verticalData[variable]) {
            setData(verticalData[variable]);
          }
        }
      }
    });
  }, []);

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

  console.log("VisCustomerRelationships - Container width:", width);
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
        <path
          d="
            M ${0} ${innerHeight}
            A 50 50 0 0 1 ${innerWidth} ${innerHeight}
          "
          fill="none"
          stroke="#04033A"
          stroke-width="3"
        />
      </g>
    </svg>
  </div>`;
}
