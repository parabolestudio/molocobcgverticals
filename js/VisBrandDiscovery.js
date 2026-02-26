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
              type: "high",
            },
            display: {
              value: +verticalData["Display"],
              label: "Display",
              type: "high",
            },
            emailCRM: {
              value: +verticalData["E-Mail & CRM"],
              label: "E-Mail & CRM",
              type: "low",
            },
            ecommerceRetailMedia: {
              value: +verticalData["E-commerce & Retail Media"],
              label: "E-commerce & Retail Media",
              type: "low",
            },
            inAppMarketing: {
              value: +verticalData["In-App Marketing"],
              label: "In-App Marketing",
              type: "low",
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
              type: "medium",
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

  const dataLow = Object.values(data)
    .filter((d) => d.type === "low")
    .sort((a, b) => b.value - a.value);
  const dataMedium = Object.values(data)
    .filter((d) => d.type === "medium")
    .sort((a, b) => b.value - a.value);
  const dataHigh = Object.values(data)
    .filter((d) => d.type === "high")
    .sort((a, b) => b.value - a.value);
  // const groupedData = { low: dataLow, medium: dataMedium, high: dataHigh };
  console.log("BRAND DISCOVERY - Low disruption channels:", dataLow);
  console.log("BRAND DISCOVERY - Medium disruption channels:", dataMedium);
  console.log("BRAND DISCOVERY - High disruption channels:", dataHigh);

  const totalLow = dataLow.reduce((sum, d) => sum + d.value, 0);
  const totalMedium = dataMedium.reduce((sum, d) => sum + d.value, 0);
  const totalHigh = dataHigh.reduce((sum, d) => sum + d.value, 0);
  const total = totalLow + totalMedium + totalHigh;
  console.log("BRAND DISCOVERY - Total low disruption:", totalLow);
  console.log("BRAND DISCOVERY - Total medium disruption:", totalMedium);
  console.log("BRAND DISCOVERY - Total high disruption:", totalHigh);
  console.log("BRAND DISCOVERY - Total traffic:", total);

  const arcGenPartLow = arc()
    .innerRadius(heightSemicircle - widthCurve)
    .outerRadius(heightSemicircle)
    .startAngle(0)
    .endAngle(Math.PI * (totalLow / total));

  const arcGenPartMedium = arc()
    .innerRadius(heightSemicircle - widthCurve)
    .outerRadius(heightSemicircle)
    .startAngle(Math.PI * (totalLow / total))
    .endAngle(Math.PI * ((totalLow + totalMedium) / total));
  const arcGenPartHigh = arc()
    .innerRadius(heightSemicircle - widthCurve)
    .outerRadius(heightSemicircle)
    .startAngle(Math.PI * ((totalLow + totalMedium) / total))
    .endAngle(Math.PI);

  const innerRadius = heightSemicircle - widthCurve;
  const outerRadius = heightSemicircle;
  const arcTransform = isMobile
    ? `translate(${0}, ${heightSemicircle}) rotate(0)`
    : `translate(${widthLeft / 2 + widthCurve / 2}, ${heightSemicircle + heightAnnotationsTop}) rotate(-90)`;

  // compute gradient for low and high arc segment, transitioning from teal (#60E2B7) to light gray (#F2F2F2)
  const angleScale = scaleLinear().domain([0, 1]).range([0, Math.PI]);
  const lowEndAngle = angleScale((totalLow + totalLow * 0.5) / total);
  const highStartAngle = angleScale(
    (totalLow + totalMedium - (totalLow + totalMedium) * 0.075) / total,
  );
  const gradientRadius = innerRadius + widthCurve * 0.25;

  function computeDividerLines() {
    // Compute all channel-boundary angles across the three arc segments
    const dividerAngles = [];

    // Use the exact same angle formulas as the arc generators
    const lowStart = 0;
    const lowEnd = Math.PI * (totalLow / total);
    let cumLow = 0;
    for (let i = 0; i < dataLow.length - 1; i++) {
      cumLow += dataLow[i].value;
      dividerAngles.push(lowStart + (lowEnd - lowStart) * (cumLow / totalLow));
    }
    dividerAngles.push(lowEnd); // boundary between low and medium

    const medStart = lowEnd;
    const medEnd = Math.PI * ((totalLow + totalMedium) / total);
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

  function computeAnnotations() {
    const annotations = [];
    const colorMap = { low: "#60E2B7", medium: "#F2F2F2", high: "#B7A6FF" };

    const lowStart = 0;
    const lowEnd = Math.PI * (totalLow / total);
    let cumLow = 0;
    for (const d of dataLow) {
      const startA = lowStart + (lowEnd - lowStart) * (cumLow / totalLow);
      const endA =
        lowStart + (lowEnd - lowStart) * ((cumLow + d.value) / totalLow);
      if (d.value > 0.04) {
        annotations.push({
          ...d,
          midAngle: (startA + endA) / 2,
          color: colorMap[d.type],
        });
      }
      cumLow += d.value;
    }

    const medStart = lowEnd;
    const medEnd = Math.PI * ((totalLow + totalMedium) / total);
    let cumMed = 0;
    for (const d of dataMedium) {
      const startA = medStart + (medEnd - medStart) * (cumMed / totalMedium);
      const endA =
        medStart + (medEnd - medStart) * ((cumMed + d.value) / totalMedium);
      if (d.value > 0.04) {
        annotations.push({
          ...d,
          midAngle: (startA + endA) / 2,
          color: colorMap[d.type],
        });
      }
      cumMed += d.value;
    }

    const highStart = medEnd;
    const highEnd = Math.PI;
    let cumHigh = 0;
    for (const d of dataHigh) {
      const startA = highStart + (highEnd - highStart) * (cumHigh / totalHigh);
      const endA =
        highStart + (highEnd - highStart) * ((cumHigh + d.value) / totalHigh);
      if (d.value > 0.04) {
        annotations.push({
          ...d,
          midAngle: (startA + endA) / 2,
          color: colorMap[d.type],
        });
      }
      cumHigh += d.value;
    }

    return annotations;
  }
  const annotationData = computeAnnotations();

  // Compute annotation positions in final SVG coordinates
  const annOffset = 35; // gap from outer arc to bottom-left of text
  const annLineHeight = 22;
  const annTextBlockHeight = annLineHeight * 2 + 0; // 2 lines + padding
  const annTextPad = 5; // horizontal gap between vertical line and text

  const arcCX = isMobile ? 0 : widthLeft / 2 + widthCurve / 2;
  const arcCY = isMobile
    ? heightSemicircle
    : heightSemicircle + heightAnnotationsTop;

  const annotationPositions = annotationData.map((ann) => {
    let arcX, arcY, blX, blY;
    if (isMobile) {
      // No rotation: SVG coords from D3-arc + translate(0, heightSemicircle)
      arcX = outerRadius * Math.sin(ann.midAngle);
      arcY = arcCY - outerRadius * Math.cos(ann.midAngle);
      const ext = outerRadius + annOffset;
      blX = ext * Math.sin(ann.midAngle);
      blY = arcCY - ext * Math.cos(ann.midAngle);
    } else {
      // -90° rotation: svgX = cx - r·cos(a), svgY = cy - r·sin(a)
      arcX = arcCX - outerRadius * 0.95 * Math.cos(ann.midAngle);
      arcY = arcCY - outerRadius * 0.95 * Math.sin(ann.midAngle);
      const ext = outerRadius + annOffset;
      blX = arcCX - ext * Math.cos(ann.midAngle);
      blY = arcCY - ext * Math.sin(ann.midAngle);
    }
    const tlX = blX;
    const tlY = blY - annTextBlockHeight;
    const textX = blX + annTextPad;
    const textLine1Y = blY - annLineHeight - 6;
    const textLine2Y = blY;
    return {
      ...ann,
      arcX,
      arcY,
      blX,
      blY,
      tlX,
      tlY,
      textX,
      textLine1Y,
      textLine2Y,
    };
  });

  const testing = false;

  return html`<div>
    ${testing &&
    html` <div>
      <p style="color:white;text-decoration: underline;">
        Vertical: ${window.customChartsConfig.vertical}
      </p>
      <p style="color:#60E2B7;">
        LOW:${" "}
        ${dataLow.map((d) => {
          console.log("BRAND DISCOVERY - Rendering low disruption channel:", d);
          return html`${d.label}: ${d.value} |`;
        })}
      </p>
      <p style="color:white;">
        MEDIUM:${" "}
        ${dataMedium.map((d) => {
          console.log(
            "BRAND DISCOVERY - Rendering medium disruption channel:",
            d,
          );
          return html`${d.label}: ${d.value} |`;
        })}
      </p>
      <p style="color:#B7A6FF;">
        HIGH:${" "}
        ${dataHigh.map((d) => {
          console.log(
            "BRAND DISCOVERY - Rendering high disruption channel:",
            d,
          );
          return html`${d.label}: ${d.value} |`;
        })}
      </p>
    </div>`}
    ${isMobile
      ? html`<div
          style="display: flex; flex-direction: column; justify-content: center; align-items: flex-start; margin-bottom: 16px;"
        >
          <p class="ban" style="color: #60E2B7; flex-shrink: 0;">
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
      <g class="annotations">
        ${annotationPositions.map(
          (ann) =>
            html`<polyline
                points="${ann.tlX},${ann.tlY} ${ann.blX},${ann.blY} ${ann.arcX},${ann.arcY}"
                fill="none"
                stroke="white"
                stroke-width="1"
                class="annotation-line"
              />
              <text
                x="${ann.textX}"
                y="${ann.textLine1Y}"
                class="annotation-label"
              >
                ${ann.label}
              </text>
              <text
                x="${ann.textX}"
                y="${ann.textLine2Y}"
                fill="${ann.color}"
                class="annotation-value"
              >
                ${Math.round(ann.value * 100)}%
              </text>`,
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
          style="display: flex; flex-direction: column; justify-content: center; align-items: flex-start;"
        >
          <p class="ban" style="color: #B7A6FF; flex-shrink: 0;">
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
