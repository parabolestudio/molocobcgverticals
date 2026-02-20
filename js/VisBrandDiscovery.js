import { html, csv, useEffect, useState } from "./lib.js";
import { REPO_URL } from "./helpers.js";

export function VisBrandDiscovery({ vertical }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    csv(`${REPO_URL}/data/data_brand_discovery.csv`).then((rawData) => {
      if (vertical) {
        const filteredData = rawData.filter((d) => d.Vertical === vertical);
        if (filteredData.length > 0) {
          const verticalData = filteredData[0];
          setData(verticalData);
        }
      }
    });
  }, []);

  const widthLeft = 492;
  // const widthRight = 293;
  const heightSemicircle = 288;
  const heightAnnotationsTop = 63;
  const widthAnnotationsRight = 207;
  const widthCurve = 86;
  const svgWidth = widthLeft + widthCurve + widthAnnotationsRight;
  const svgHeight = heightSemicircle + heightAnnotationsTop;

  console.log("BRAND DISCOVERY - Loaded data:", data);

  if (!data) return html`<div>Loading data...</div>`;

  return html`<div>
    <svg
      width="${svgWidth}"
      height="${svgHeight}"
      style="background: #f2f2f2;"
    ></svg>
    <div style="display: flex; ">
      <div
        style="width: ${widthLeft}px; flex-basis: ${widthLeft}px; flex-shrink: 0;"
      >
        <p class="ban" style="color: #60E2B7">64%</p>
        <p class="ban-label" style="max-width: 220px;">
          of traffic is organic direct, suggesting strong brand equity provides
          meaningful insulation.
        </p>
      </div>
      <div>
        <p class="ban" style="color: #B7A6FF">24%</p>
        <p class="ban-label">
          of FinTech traffic comes from channels facing high disruption, with
          organic SEO, the foundation of most digital marketing strategies,
          particularly exposed.
        </p>
      </div>
    </div>
  </div>`;
}
