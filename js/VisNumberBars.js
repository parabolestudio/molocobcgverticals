import { html, useState, useEffect, useRef, scaleLinear } from "./lib.js";

export function VisNumberBars({ id, variable, data, average, isMobile }) {
  if (!data) return html`<div>Loading data...</div>`;
  console.log("NUMBER BARS - Loaded data:", variable, data, average, isMobile);

  const [width, setWidth] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        const w = Math.floor(entry.contentRect.width);
        console.log("NUMBER BARS - Container width:", w);
        setWidth(w);
      }
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  console.log("NUMBER BARS - Current width:", width);

  const height = 80;
  const heightBar = 50;
  const margin = { top: 0, right: 0, bottom: 0, left: 0 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const scaleX = scaleLinear().domain([0, 100]).range([0, innerWidth]);

  return html`<div
    class="number-bars-container"
    style="${isMobile
      ? "flex-direction: column-reverse; gap: 10px;"
      : "gap: 30px;"}"
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
            width="${scaleX(data)}"
            height="${heightBar}"
            fill="url(#gradient)"
          />
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
