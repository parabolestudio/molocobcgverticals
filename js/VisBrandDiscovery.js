import { html, csv, useEffect, useState, arc } from "./lib.js";
import { REPO_URL } from "./helpers.js";

export function VisBrandDiscovery({ vertical }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    csv(`${REPO_URL}/data/data_brand_discovery.csv`).then((rawData) => {
      if (vertical) {
        const filteredData = rawData.filter((d) => d.Vertical === vertical);
        if (filteredData.length > 0) {
          const verticalData = filteredData[0];
          console.log("BRAND DISCOVERY - Loaded data:", verticalData);

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
          setData(data);
        }
      }
    });
  }, []);

  if (!data) return html`<div>Loading data...</div>`;

  const widthLeft = 492;
  // const widthRight = 293;
  const heightSemicircle = 288;
  const heightAnnotationsTop = 63;
  const widthAnnotationsRight = 207;
  const widthCurve = 86;
  const svgWidth = widthLeft + widthCurve + widthAnnotationsRight;
  const svgHeight = heightSemicircle + heightAnnotationsTop;

  console.log("BRAND DISCOVERY - Formatted data:", data);

  const dataLow = Object.values(data).filter((d) => d.type === "low");
  const dataMedium = Object.values(data).filter((d) => d.type === "medium");
  const dataHigh = Object.values(data).filter((d) => d.type === "high");
  console.log("BRAND DISCOVERY - Low disruption channels:", dataLow);
  console.log("BRAND DISCOVERY - Medium disruption channels:", dataMedium);
  console.log("BRAND DISCOVERY - High disruption channels:", dataHigh);

  const totalLow = dataLow.reduce((sum, d) => sum + d.value, 0);
  const totalMedium = dataMedium.reduce((sum, d) => sum + d.value, 0);
  const totalHigh = dataHigh.reduce((sum, d) => sum + d.value, 0);
  console.log("BRAND DISCOVERY - Total low:", totalLow);
  console.log("BRAND DISCOVERY - Total medium:", totalMedium);
  console.log("BRAND DISCOVERY - Total high:", totalHigh);

  // const arcGenerator = arc()
  //   .innerRadius(heightSemicircle - widthCurve)
  //   .outerRadius(heightSemicircle)
  //   .startAngle(0)
  //   .endAngle(Math.PI);

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

  return html`<div>
    <svg width="${svgWidth}" height="${svgHeight}" style="overflow: visible;">
      <path
        d="${arcGenPartLow()}"
        fill="#60E2B7"
        transform="translate(${widthLeft / 2 +
        widthCurve / 2}, ${heightSemicircle +
        heightAnnotationsTop}) rotate(-90)"
      />
      <path
        d="${arcGenPartMedium()}"
        fill="#F2F2F2"
        transform="translate(${widthLeft / 2 +
        widthCurve / 2}, ${heightSemicircle +
        heightAnnotationsTop}) rotate(-90)"
      />
      <path
        d="${arcGenPartHigh()}"
        fill="#B7A6FF"
        transform="translate(${widthLeft / 2 +
        widthCurve / 2}, ${heightSemicircle +
        heightAnnotationsTop}) rotate(-90)"
      />
    </svg>
    <div style="display: flex; ">
      <div
        style="width: ${widthLeft}px; flex-basis: ${widthLeft}px; flex-shrink: 0;"
      >
        <p class="ban" style="color: #60E2B7">
          ${(totalLow * 100).toFixed(0)}%
        </p>
        <p class="ban-label" style="max-width: 220px;">
          of traffic is organic direct, suggesting strong brand equity provides
          meaningful insulation.
        </p>
      </div>
      <div>
        <p class="ban" style="color: #B7A6FF">
          ${(totalHigh * 100).toFixed(0)}%
        </p>
        <p class="ban-label">
          of FinTech traffic comes from channels facing high disruption, with
          organic SEO, the foundation of most digital marketing strategies,
          particularly exposed.
        </p>
      </div>
    </div>
  </div>`;
}
