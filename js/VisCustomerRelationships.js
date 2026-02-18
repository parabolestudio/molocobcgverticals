import { html, csv, useEffect, useState } from "./lib.js";

export function VisCustomerRelationships({ vertical, variable }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    csv(`./data/data_customer_relationships.csv`).then((rawData) => {
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

  console.log("CUSTOMER RELATIONSHIPS - Loaded data:", variable, data);

  if (!data) return html`<div>Loading data...</div>`;

  return html`<div>
    Coded Customer Relationships Visualization for ${vertical} and ${" "}
    ${variable}
  </div>`;
}
