import { html, arc, scaleLinear } from "./lib.js";
import { useInView } from "./useInView.js";
import { getVariableClass } from "./helpers.js";

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
  "Platform engagement depth": [
    {
      type: "low",
      min: 0,
      max: 6.0,
    },
    {
      type: "medium",
      min: 6.1,
      max: 8.3,
    },
    {
      type: "high",
      min: 8.4,
      max: 10,
    },
  ],
};

const averageValues = {
  "Acquisition strength": 7.6,
  "Sustained loyalty": 6.92,
  "Platform engagement depth": 6.82,
};

export function VisCustomerRelationships({ id, variable, data, isMobile }) {
  if (!data) return html`<div>Loading data...</div>`;

  // vis dimensions
  const visContainer = document.querySelector(`#${id}`);
  let width =
    visContainer && visContainer.offsetWidth ? visContainer.offsetWidth : 600;
  if (isMobile) {
    width = Math.min(width, 280); // set a max width for mobile to maintain aspect ratio
  }
  const aspectRatio = 352 / 160; // width:height ratio
  const height = width / aspectRatio;
  const margin = { top: 0, right: 25, bottom: 0, left: 25 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const arcWidth = isMobile ? 25 : 30;

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

  const onVisible = () => {
    const container = document.querySelector(`#${id}`);
    if (!container) return;

    const dataArcEl = container.querySelector(".data-arc");
    const dataCircleEl = container.querySelector(
      `.${getVariableClass(variable)} .data-circle`,
    );
    const banEl = container.querySelector(".ban");

    // Arc generator for animation
    const dataArcGen = arc()
      .innerRadius(innerHeight - arcWidth / 2)
      .outerRadius(innerHeight - arcWidth / 2)
      .startAngle(0);

    // Phase 1: Animate the data arc endAngle from 0 to the actual value
    const duration = 800;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    setTimeout(() => {
      const startTime = performance.now();

      const animateArc = (currentTime) => {
        const elapsed = currentTime - startTime;
        const rawProgress = Math.min(elapsed / duration, 1);
        const progress = easeOutCubic(rawProgress);

        const currentAngle = dataAngle * progress;
        if (dataArcEl) {
          dataArcEl.setAttribute("d", dataArcGen.endAngle(currentAngle)());
        }

        if (rawProgress < 1) {
          requestAnimationFrame(animateArc);
        } else {
          // Phase 2: Animate in the data circle with a slight delay
          setTimeout(() => {
            if (dataCircleEl) {
              const bbox = dataCircleEl.getBBox();
              const cx = bbox.x + bbox.width / 2;
              const cy = bbox.y + bbox.height / 2;
              dataCircleEl.style.transformOrigin = `${cx}px ${cy}px`;
              dataCircleEl.classList.add("vis-highlight-circles");
            }

            // Phase 3: Animate in the ban with a slight delay after that
            setTimeout(() => {
              if (banEl) {
                const bbox = banEl.getBBox();
                const cx = bbox.x + bbox.width / 2;
                const cy = bbox.y + bbox.height;
                banEl.style.transformOrigin = `${cx}px ${cy}px`;
                banEl.classList.add("vis-highlight-ban");
              }
            }, 150);
          }, 0);
        }
      };

      requestAnimationFrame(animateArc);
    }, 200);
  };

  const containerRef = useInView({
    onVisible: () => onVisible(),
  });

  return html`<div
    class="customer-relationships-container ${getVariableClass(variable)}"
    ref=${containerRef}
  >
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
            dx="${isMobile ? "2" : "0"}"
            text-anchor="end"
            class="axis-text"
          >
            10
          </text>
          <text
            x="${innerWidth / 2}"
            y="${innerHeight - 5}"
            text-anchor="middle"
            class="ban vis-hidden"
          >
            ${data ? Number(data).toFixed(1) : ""}
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
            fill="#04033A"
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
              avg.
            </text>
          </g>
        </g>
        <g
          class="data-elements"
          transform="${`translate(${innerWidth / 2}, ${innerHeight}) rotate(-90)`}"
        >
          <path
            d="M0,0"
            fill="#04033A"
            stroke="#04033A"
            stroke-width="3"
            class="data-arc"
          />
          <circle
            cx="${dataElement.circlePosition.x}"
            cy="${dataElement.circlePosition.y}"
            r="6"
            fill="#04033A"
            class="data-circle vis-hidden"
          />
        </g>
      </g>
    </svg>
  </div>`;
}
