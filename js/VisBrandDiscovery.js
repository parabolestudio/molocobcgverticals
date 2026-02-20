import { html, csv, useEffect, useState } from "./lib.js";

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

  console.log("BRAND DISCOVERY - Loaded data:", data);

  if (!data) return html`<div>Loading data...</div>`;

  return html`<div>Coded Brand Discovery Visualization for ${vertical}</div>`;
}
