console.log("Viz script loaded");

import { renderVis, csv } from "./js/lib.js";
import { REPO_URL } from "./js/helpers.js";
import { VisQuadrant } from "./js/VisQuadrant.js";
import { VisBrandDiscovery } from "./js/VisBrandDiscovery.js";
import { VisServiceDisruption } from "./js/VisServiceDisruption.js";
import { VisCustomerRelationships } from "./js/VisCustomerRelationships.js";

// detect vertical from global config (embed code in head)
customChartsConfig = window.customChartsConfig || {};

// detect mobile for conditional rendering
const mobile = window.innerWidth <= 768;
console.log("Is mobile:", mobile, window.innerWidth);

// re-render on window resize to handle mobile/desktop switch
window.addEventListener("resize", () => {
  const isNowMobile = window.innerWidth <= 768;
  if (isNowMobile !== mobile) {
    location.reload();
  }
});

// QUADRANT
renderVis({
  id: "vis-quadrant",
  component: VisQuadrant,
  vertical: customChartsConfig.vertical || null,
  isMobile: mobile,
});

// BRAND DISCOVERY
renderVis({
  id: "vis-brand-discovery",
  component: VisBrandDiscovery,
  vertical: customChartsConfig.vertical || null,
  isMobile: mobile,
});

// SERVICE DISRUPTION
csv(`${REPO_URL}/data/data_service_disruption.csv`).then((rawData) => {
  if (customChartsConfig.vertical) {
    const filteredData = rawData.filter(
      (d) => d.Vertical === customChartsConfig.vertical,
    );
    if (filteredData.length > 0) {
      console.log("SERVICE DISRUPTION - Loaded data:", filteredData[0]);
      const verticalData = filteredData[0];

      // render each variable's vis
      renderVis({
        id: "vis-service-disruption-disintermediation",
        component: VisServiceDisruption,
        variable: "Disintermediation",
        data: verticalData["Disintermediation"],
        isMobile: mobile,
      });
      renderVis({
        id: "vis-service-disruption-data-standardization",
        component: VisServiceDisruption,
        variable: "Data standardization",
        data: verticalData["Data standardization"],
        isMobile: mobile,
      });
      renderVis({
        id: "vis-service-disruption-regulatory-shield",
        component: VisServiceDisruption,
        variable: "Regulatory shield",
        data: verticalData["Regulatory shield"],
        isMobile: mobile,
      });

      // replace summary text in Webflow
      renderVis({
        id: "vis-service-disruption-total-score",
        component: VisServiceDisruption,
        vertical: customChartsConfig.vertical || null,
        variable: "Overall score",
        data: verticalData["Overall score"],
        isMobile: mobile,
      });
      renderVis({
        id: "vis-service-disruption-total-label",
        component: VisServiceDisruption,
        vertical: customChartsConfig.vertical || null,
        variable: "Disruption value",
        data: verticalData["Disruption value"],
        isMobile: mobile,
      });
    }
  }
});

// CUSTOMER RELATIONSHIPS
csv(`${REPO_URL}/data/data_customer_relationships.csv`).then((rawData) => {
  if (customChartsConfig.vertical) {
    const filteredData = rawData.filter(
      (d) => d.Vertical === customChartsConfig.vertical,
    );
    if (filteredData.length > 0) {
      console.log("CUSTOMER RELATIONSHIPS - Loaded data:", filteredData[0]);
      const verticalData = filteredData[0];

      renderVis({
        id: "vis-customer-relationship-acquisition-strength",
        component: VisCustomerRelationships,
        vertical: customChartsConfig.vertical || null,
        variable: "Acquisition strength",
        data: verticalData["Acquisition strength"],
        isMobile: mobile,
      });
      renderVis({
        id: "vis-customer-relationship-sustained-loyalty",
        component: VisCustomerRelationships,
        vertical: customChartsConfig.vertical || null,
        variable: "Sustained loyalty",
        data: verticalData["Sustained loyalty"],
        isMobile: mobile,
      });
      renderVis({
        id: "vis-customer-relationship-platform-engagement-depth",
        component: VisCustomerRelationships,
        vertical: customChartsConfig.vertical || null,
        variable: "Platform engagement depth",
        data: verticalData["Platform engagement depth"],
        isMobile: mobile,
      });
    }
  }
});
