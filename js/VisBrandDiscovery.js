import { html, csv, useEffect, useState, arc, scaleLinear } from "./lib.js";
import { REPO_URL } from "./helpers.js";

export function VisBrandDiscovery({ vertical, isMobile }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    csv(`${REPO_URL}/data/data_brand_discovery.csv`).then((rawData) => {
      if (vertical) {
        const filteredData = rawData.filter((d) => d.Vertical === vertical);
        if (filteredData.length > 0) {
          const verticalData = filteredData[0];
          console.log("BRAND DISCOVERY - Loaded data:", verticalData, isMobile);

          const data = {
            affiliates: {
              value: +verticalData["Affiliates"],
              label: "Affiliates",
              type: "medium", // TODO: check
            },
            display: {
              value: +verticalData["Display"],
              label: "Display",
              type: "high",
            },
            emailCRM: {
              value: +verticalData["E-Mail & CRM"],
              label: "E-Mail & CRM",
              type: "low", // TODO: check
            },
            ecommerceRetailMedia: {
              value: +verticalData["E-commerce & Retail Media"],
              label: "E-commerce & Retail Media",
              type: "high", // TODO: check
            },
            inAppMarketing: {
              value: +verticalData["In-App Marketing"],
              label: "In-App Marketing",
              type: "low", // TODO: check
            },
            organicSeoSocial: {
              value: +verticalData["Organic (SEO, Social)"],
              label: "Organic (SEO, Social)",
              type: "high",
            },
            organicDirect: {
              value: +verticalData["Organic Direct"],
              label: "Organic Direct",
              type: "low",
            },
            paidSearch: {
              value: +verticalData["Paid Search"],
              label: "Paid Search",
              type: "high",
            },
            socialMedia: {
              value: +verticalData["Social Media"],
              label: "Social Media",
              type: "low",
            },
            video: {
              value: +verticalData["Video (YT, OTT)"],
              label: "Video (YT, OTT)",
              type: "medium",
            },
          };
          // filter out channels with 0% contribution to avoid cluttering the viz with irrelevant labels
          Object.keys(data).forEach((key) => {
            if (data[key].value === 0) {
              delete data[key];
            }
          });

          setData(data);
        }
      }
    });
  }, []);

  if (!data) return html`<div>Loading data...</div>`;

  const widthLeft = isMobile ? 365 : 492;
  const heightSemicircle = isMobile ? 213 : 288;
  const heightAnnotationsTop = isMobile ? 100 : 63;
  const widthAnnotationsRight = isMobile ? 50 : 207;
  const widthCurve = isMobile ? 65 : 86;
  const svgWidth = widthLeft + widthCurve + widthAnnotationsRight;
  const svgHeight = heightSemicircle + heightAnnotationsTop;

  console.log("BRAND DISCOVERY - Formatted data:", data);

  const dataLow = Object.values(data).filter((d) => d.type === "low");
  const dataMedium = Object.values(data).filter((d) => d.type === "medium");
  const dataHigh = Object.values(data).filter((d) => d.type === "high");
  // const groupedData = { low: dataLow, medium: dataMedium, high: dataHigh };
  console.log("BRAND DISCOVERY - Low disruption channels:", dataLow);
  console.log("BRAND DISCOVERY - Medium disruption channels:", dataMedium);
  console.log("BRAND DISCOVERY - High disruption channels:", dataHigh);

  const totalLow = dataLow.reduce((sum, d) => sum + d.value, 0);
  const totalMedium = dataMedium.reduce((sum, d) => sum + d.value, 0);
  const totalHigh = dataHigh.reduce((sum, d) => sum + d.value, 0);

  const arcGenPartLow = arc()
    .innerRadius(heightSemicircle - widthCurve)
    .outerRadius(heightSemicircle)
    .startAngle(0)
    .endAngle(Math.PI * (totalLow / (totalLow + totalHigh)));

  const arcGenPartMedium = arc()
    .innerRadius(heightSemicircle - widthCurve)
    .outerRadius(heightSemicircle)
    .startAngle(Math.PI * (totalLow / (totalLow + totalHigh)))
    .endAngle(
      Math.PI *
        ((totalLow + totalMedium) / (totalLow + totalMedium + totalHigh)),
    );
  const arcGenPartHigh = arc()
    .innerRadius(heightSemicircle - widthCurve)
    .outerRadius(heightSemicircle)
    .startAngle(
      Math.PI *
        ((totalLow + totalMedium) / (totalLow + totalMedium + totalHigh)),
    )
    .endAngle(Math.PI);

  const innerRadius = heightSemicircle - widthCurve;
  const outerRadius = heightSemicircle;
  const arcTransform = isMobile
    ? `translate(${0}, ${heightSemicircle}) rotate(0)`
    : `translate(${widthLeft / 2 + widthCurve / 2}, ${heightSemicircle + heightAnnotationsTop}) rotate(-90)`;

  // compute gradient for low and high arc segment, transitioning from teal (#60E2B7) to light gray (#F2F2F2)
  const angleScale = scaleLinear().domain([0, 1]).range([0, Math.PI]);
  const lowEndAngle = angleScale((totalLow + totalLow * 0.5) / 1);
  const highStartAngle = angleScale(
    (totalLow + totalMedium - (totalLow + totalMedium) * 0.075) / 1,
  );
  const gradientRadius = innerRadius + widthCurve * 0.25;

  function computeDividerLines() {
    // Compute all channel-boundary angles across the three arc segments
    const dividerAngles = [];

    // Use the exact same angle formulas as the arc generators
    const lowStart = 0;
    const lowEnd = Math.PI * (totalLow / (totalLow + totalHigh));
    let cumLow = 0;
    for (let i = 0; i < dataLow.length - 1; i++) {
      cumLow += dataLow[i].value;
      dividerAngles.push(lowStart + (lowEnd - lowStart) * (cumLow / totalLow));
    }
    dividerAngles.push(lowEnd); // boundary between low and medium

    const medStart = lowEnd;
    const medEnd =
      Math.PI *
      ((totalLow + totalMedium) / (totalLow + totalMedium + totalHigh));
    let cumMed = 0;
    for (let i = 0; i < dataMedium.length - 1; i++) {
      cumMed += dataMedium[i].value;
      dividerAngles.push(
        medStart + (medEnd - medStart) * (cumMed / totalMedium),
      );
    }
    dividerAngles.push(medEnd); // boundary between medium and high

    const highStart = medEnd;
    const highEnd = Math.PI;
    let cumHigh = 0;
    for (let i = 0; i < dataHigh.length - 1; i++) {
      cumHigh += dataHigh[i].value;
      dividerAngles.push(
        highStart + (highEnd - highStart) * (cumHigh / totalHigh),
      );
    }

    // Convert each angle to a radial line (D3 arc coords: x = r·sin(a), y = -r·cos(a))
    return dividerAngles.map((a) => ({
      x1: innerRadius * Math.sin(a),
      y1: -innerRadius * Math.cos(a),
      x2: outerRadius * Math.sin(a),
      y2: -outerRadius * Math.cos(a),
    }));
  }
  const dividerLines = computeDividerLines();

  return html`<div>
    ${isMobile
      ? html`<div
          style="display: flex; justify-content: center; align-items: flex-start; gap: 16px; margin-bottom: 16px;"
        >
          <p
            class="ban"
            style="color: #60E2B7; flex-basis: 156px;flex-shrink: 0;"
          >
            ${(totalLow * 100).toFixed(0)}%
          </p>
          <p class="ban-label" style="max-width: 220px;">
            of traffic is organic direct, suggesting strong brand equity
            provides meaningful insulation.
          </p>
        </div>`
      : null}
    <svg
      width="${isMobile ? svgHeight : svgWidth}"
      height="${isMobile ? svgWidth : svgHeight}"
      style="overflow: visible;"
    >
      <defs>
        <linearGradient
          id="lowGradient"
          gradientUnits="userSpaceOnUse"
          x1="0"
          y1="${-gradientRadius}"
          x2="${gradientRadius * Math.sin(lowEndAngle)}"
          y2="${-gradientRadius * Math.cos(lowEndAngle)}"
        >
          <stop offset="0%" stop-color="#1AA476" />
          <stop offset="20%" stop-color="#60E2B7" />
          <stop offset="100%" stop-color="#F2F2F2" />
        </linearGradient>
        <linearGradient
          id="highGradient"
          gradientUnits="userSpaceOnUse"
          x1="${gradientRadius * Math.sin(highStartAngle)}"
          y1="${-gradientRadius * Math.cos(highStartAngle)}"
          x2="0"
          y2="${gradientRadius}"
        >
          <stop stop-color="#F2F2F2" />
          <stop offset="0.5" stop-color="#B7A6FF" />
          <stop offset="1" stop-color="#5E3FE0" />
        </linearGradient>
      </defs>

      <path d="${arcGenPartLow()}" fill="#60E2B7" transform="${arcTransform}" />
      <path
        d="${arcGenPartMedium()}"
        fill="#F2F2F2"
        transform="${arcTransform}"
      />
      <path
        d="${arcGenPartHigh()}"
        fill="#B7A6FF"
        transform="${arcTransform}"
      />
      <g class="divider-lines">
        ${dividerLines.map(
          ({ x1, y1, x2, y2 }) =>
            html`<line
              x1="${x1}"
              y1="${y1}"
              x2="${x2}"
              y2="${y2}"
              stroke="#04033A"
              stroke-width="1"
              transform="${arcTransform}"
            />`,
        )}
      </g>
    </svg>
    ${!isMobile
      ? html`<div style="display: flex;">
          <div
            style="width: ${widthLeft}px; flex-basis: ${widthLeft}px; flex-shrink: 0;"
          >
            <p class="ban" style="color: #60E2B7">
              ${(totalLow * 100).toFixed(0)}%
            </p>
            <p class="ban-label" style="max-width: 220px;">
              of traffic is organic direct, suggesting strong brand equity
              provides meaningful insulation.
            </p>
          </div>
          <div>
            <p class="ban" style="color: #B7A6FF">
              ${(totalHigh * 100).toFixed(0)}%
            </p>
            <p class="ban-label">
              of FinTech traffic comes from channels facing high disruption,
              with organic SEO, the foundation of most digital marketing
              strategies, particularly exposed.
            </p>
          </div>
        </div>`
      : null}
    ${isMobile
      ? html`<div
          style="display: flex; justify-content: center; align-items: flex-start; gap: 16px; margin-bottom: 16px;"
        >
          <p
            class="ban"
            style="color: #B7A6FF; flex-basis: 156px;flex-shrink: 0;"
          >
            ${(totalHigh * 100).toFixed(0)}%
          </p>
          <p class="ban-label" style="max-width: 220px;">
            of FinTech traffic comes from channels facing high disruption, with
            organic SEO, the foundation of most digital marketing strategies,
            particularly exposed.
          </p>
        </div>`
      : null}
  </div>`;
}
