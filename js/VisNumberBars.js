import { html, useState, useEffect, useRef, scaleLinear } from "./lib.js";
import { useInView } from "./useInView.js";

export function VisNumberBars({ id, data, average, isMobile }) {
  if (!data) return html`<div>Loading data...</div>`;

  const [width, setWidth] = useState(0);
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const w = Math.floor(entry.contentRect.width);
        setWidth(w);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  const height = 80;
  const heightBar = 50;
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const scaleX = scaleLinear().domain([0, 100]).range([0, innerWidth]);

  useEffect(() => {
    if (!isInView || width <= 0) return;
    const bar = containerRef.current?.querySelector(
      `.number-bars-svg-container-${id} .bar-rect-1`,
    );
    if (bar) {
      bar.style.transition = "width 1s ease-in-out";
      bar.style.width = `${scaleX(data)}px`;
    }

    setTimeout(() => {
      const bar2 = containerRef.current?.querySelector(
        `.number-bars-svg-container-${id} .bar-rect-2`,
      );
      if (bar2) {
        bar2.style.transition = "width 1s ease-in-out";
        bar2.style.width = `${scaleX(average) - scaleX(data)}px`;
      }
      setTimeout(() => {
        const averageGroupText = containerRef.current?.querySelector(
          `.number-bars-svg-container-${id} .average-group text`,
        );
        if (averageGroupText) {
          averageGroupText.classList.remove("vis-hidden");
        }
        const averageGroupLine = containerRef.current?.querySelector(
          `.number-bars-svg-container-${id} .average-group line`,
        );
        if (averageGroupLine) {
          averageGroupLine.classList.remove("vis-hidden");
        }
      }, 1000);
    }, 1000);
  }, [isInView, width]);

  const containerRefInView = useInView({
    onVisible: () => setIsInView(true),
  });

  const avgLeft = average !== null && average > 50 && isMobile;

  return html`<div
    class="number-bars-container"
    style="${isMobile
      ? "flex-direction: column-reverse; gap: 10px;"
      : "gap: 30px;"}"
    ref=${containerRefInView}
  >
    <span
      class="number number-bars-${data}"
      style="${!isMobile ? "width: 210px;" : ""}"
      >${data}%</span
    >
    <div
      ref=${containerRef}
      class="number-bars-svg-container-${id}"
      style="flex-grow: 1; min-width: 0; overflow: hidden; "
    >
      ${width > 0 &&
      html`<svg
        width="${width}"
        height="${height}"
        style="background: transparent;"
      >
        <g transform="translate(${margin.left}, ${margin.top})">
          <rect
            x="0"
            y="${innerHeight - heightBar}"
            height="${heightBar}"
            fill="url(#gradient)"
            style="width: 0;"
            class="bar-rect-1"
          />

          ${average !== null &&
          html`<g class="average-group ">
            <text
              x="${avgLeft ? scaleX(average) - 5 : scaleX(average) + 5}"
              y="${15}"
              text-anchor="${avgLeft ? "end" : "start"}"
              fill="#9494AA"
              font-size="14"
              font-family="Montserrat, sans-serif"
              font-weight="500"
              class="vis-hidden"
              style="transition: opacity 0.5s ease-in-out; "
            >
              all industries:${" "}
              <tspan fill="#04033A" font-weight="700">${average}%</tspan>
            </text>
            <rect
              x="${scaleX(data)}"
              y="${innerHeight - heightBar}"
              height="${heightBar}"
              style="width: 0;"
              fill="#DBDBDB"
              class="bar-rect-2"
            />
            <line
              x1="${scaleX(average)}"
              y1="${0}"
              x2="${scaleX(average)}"
              y2="${innerHeight}"
              stroke="#9494AA"
              stroke-width="1"
              stroke-dasharray="3 3"
              style="mix-blend-mode: multiply;"
              class="vis-hidden"
              style="transition: opacity 0.5s ease-in-out; "
            />
          </g>`}
        </g>
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="142%" y2="0%">
            <stop offset="0%" style="stop-color:#1AA476; stop-opacity:1" />
            <stop offset="100%" style="stop-color:#3D5F53; stop-opacity:1" />
          </linearGradient>
        </defs>
      </svg>`}
    </div>
  </div> `;
}
