import { html, scaleThreshold, scalePoint, scaleLinear } from "./lib.js";
import { useInView } from "./useInView.js";
import { getVariableClass } from "./helpers.js";

const averageValues = {
  Disintermediation: 4.7,
  "Data standardization": 3.5,
  "Regulatory shield": 5.8,
};

export function VisServiceDisruption({ variable, data, isMobile }) {
  // console.log("SERVICE DISRUPTION - Loaded data:", variable, data, isMobile);

  if (!data) return html`<div>Loading data...</div>`;

  if (variable === "Overall score") {
    return html`<span>${data}</span>`;
  }
  if (variable === "Disruption value") {
    return html`<span>${data} disruption</span>`;
  }

  const circleDiameter = isMobile ? 35 : 40;
  const circleGap = isMobile ? 10 : 15;
  const avgElementsHeight = 50;
  const height = isMobile
    ? circleDiameter * 2 + circleGap + avgElementsHeight
    : 70;
  const width = isMobile ? circleDiameter * 5 + 4 * circleGap : 495;
  const margin = { top: 0, right: 5, bottom: 0, left: 5 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const avgValue = averageValues[variable];

  const disruptionScale = scaleThreshold()
    .domain([2.001, 4.001, 6.001, 8.001, 10.001])
    .range(["VeryLow", "Low", "Moderate", "High", "VeryHigh"]);

  const colorMapping = {
    VeryLow: "#1AA476",
    Low: "#60E2B7",
    Moderate: "#D9D9D9",
    High: "#B7A6FF",
    VeryHigh: "#7659EE",
  };

  const scaleXDesktop = scaleLinear()
    .domain([1, 10])
    .range([0, innerWidth - circleDiameter]);
  const scaleXMobile = scalePoint()
    .domain([1, 2, 3, 4, 5])
    .range([0, innerWidth - circleDiameter]);

  const avgAbove = avgValue <= 5;

  const scaleYMobileRangeStart = avgAbove
    ? circleDiameter / 2 + avgElementsHeight
    : circleDiameter / 2;
  const scaleYMobileRangeEnd = avgAbove
    ? innerHeight - circleDiameter / 2
    : innerHeight - circleDiameter / 2 - avgElementsHeight;
  const scaleYMobile = scaleThreshold()
    .domain([6])
    .range([scaleYMobileRangeStart, scaleYMobileRangeEnd]);

  // Mobile avg element positioning
  const scaleXMobileLinear = scaleLinear()
    .domain([1, 5])
    .range([0, innerWidth - circleDiameter]);
  const avgXMobile =
    scaleXMobileLinear(avgAbove ? avgValue : avgValue - 5) + circleDiameter / 2;
  const avgGroupYMobile = avgAbove
    ? 35
    : scaleYMobileRangeEnd - circleDiameter / 2 - 2;
  const avgLineY2Mobile = avgAbove
    ? scaleYMobileRangeStart - circleDiameter / 2
    : innerHeight - avgGroupYMobile - circleDiameter / 2 - 18;
  const avgTextDyMobile = avgAbove ? -10 : avgLineY2Mobile + 8;

  const onVisible = () => {
    const number = document.querySelector(
      `.service-disruption-number-${getVariableClass(variable)}`,
    );
    if (number) {
      number.classList.remove("vis-hidden");
    }

    Array.from({ length: 10 }, (_, i) => {
      setTimeout(
        () => {
          const selector = `.circle-${getVariableClass(variable)}-${i + 1}`;
          const element = document.querySelector(selector);
          if (element) {
            const bbox = element.getBBox();
            const cx = bbox.x + bbox.width / 2;
            const cy = bbox.y + bbox.height / 2;
            element.style.transformOrigin = `${cx}px ${cy}px`;
            element.classList.add("vis-highlight-circles");
          }
        },
        300 + i * 80,
      );
    });
    setTimeout(() => {
      const averageElement = document.querySelector(
        `.average-elements-${getVariableClass(variable)}`,
      );
      if (averageElement) {
        averageElement.classList.remove("vis-hidden");
      }
    }, 12 * 80);
  };

  const containerRef = useInView({
    onVisible: () => onVisible(),
  });

  return html`<div
    class="service-disruption-container"
    ref=${containerRef}
    style="${isMobile
      ? avgAbove
        ? "align-items: flex-end; margin-top: -10px;"
        : "align-items: flex-start; margin-top: 15px; margin-bottom: -20px;"
      : "align-items: center;"}"
  >
    <span
      class="service-disruption-number service-disruption-number-${getVariableClass(
        variable,
      )} vis-hidden"
      >${data}</span
    >
    <svg width="${width}" height="${height}">
      <g transform="translate(${margin.left}, ${margin.top})">
        <g>
          ${Array.from({ length: 10 }, (_, i) => {
            const type = i < data ? "active" : "inactive";
            const color =
              type === "active"
                ? colorMapping[disruptionScale(data)]
                : "transparent";
            const cx = isMobile
              ? scaleXMobile(i + 1 <= 5 ? i + 1 : i + 1 - 5) +
                circleDiameter / 2
              : scaleXDesktop(i + 1) + circleDiameter / 2;
            const cy = isMobile
              ? scaleYMobile(i + 1)
              : innerHeight / 2 + circleDiameter / 2 - 8;

            const showGradient =
              i + 1 === Math.round(data) && data % 2 === 0 && data < 10;

            return html`<g>
              ${showGradient &&
              html`<defs>
                <linearGradient
                  id="gradient-${disruptionScale(data)}-${i + 1}"
                  x1="0"
                  y1="0"
                  x2="100%"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stop-color="${colorMapping[disruptionScale(data)]}"
                  />
                  <stop
                    offset="100%"
                    stop-color="${colorMapping[disruptionScale(data + 2)]}"
                  />
                </linearGradient>
              </defs>`}
              <circle
                class="circle-${getVariableClass(variable)}-${i + 1} vis-hidden"
                cx="${cx}"
                cy="${cy}"
                r="${circleDiameter / 2}"
                fill="${showGradient
                  ? `url(#gradient-${disruptionScale(data)}-${i + 1})`
                  : color}"
                stroke="${type === "active" ? "none" : "#81819C"}"
                style="transition: opacity 0.3s ease-in-out; ${type ===
                "inactive"
                  ? "stroke-width: 0.5;"
                  : ""}"
            /></g>`;
          })}
        </g>

        <g
          class="${`average-elements-${getVariableClass(variable)} vis-hidden`}"
          transform="translate(${isMobile
            ? avgXMobile
            : scaleXDesktop(avgValue) + circleDiameter / 2}, ${isMobile
            ? avgGroupYMobile
            : 0})"
          style="transition: opacity 0.3s ease-in-out;"
        >
          <text
            class="avg-text"
            dy="${isMobile ? avgTextDyMobile : innerHeight + 12}"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            cross-vertical average: ${avgValue}
          </text>
          <line
            y1="0"
            y2="${isMobile ? avgLineY2Mobile : innerHeight + 2}"
            class="avg-line"
            stroke-width="1px"
            stroke="#9494aa"
            stroke-dasharray="3 3"
          />
        </g>
      </g>
    </svg>
  </div>`;
}
