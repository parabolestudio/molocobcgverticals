import { html, csv, useEffect, useState } from "./lib.js";

export function VisServiceDisruption({ vertical, variable }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    csv(`./data/data_service_disruption.csv`).then((rawData) => {
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

  console.log("SERVICE DISRUPTION - Loaded data:", data);

  if (!data) return html`<div>Loading data...</div>`;

  return html`<div>
    Coded Service Disruption Visualization for ${vertical} and ${" "}
    ${variable}
  </div>`;
}
