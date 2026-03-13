console.log("Viz script loaded");

import { renderVis, csv } from "./js/lib.js";
import { REPO_URL } from "./js/helpers.js";
import { VisQuadrant } from "./js/VisQuadrant.js";
import { VisBrandDiscovery } from "./js/VisBrandDiscovery.js";
import { VisServiceDisruption } from "./js/VisServiceDisruption.js";
import { VisCustomerRelationships } from "./js/VisCustomerRelationships.js";
import { VisNumberBars } from "./js/VisNumberBars.js";

// detect vertical from global config (embed code in head)
customChartsConfig = window.customChartsConfig || {};
const vertical = customChartsConfig.vertical || null;
if (!vertical) {
  console.warn(
    "No vertical specified in customChartsConfig. Please set it in the embed code.",
  );
} else {
  // detect mobile for conditional rendering
  const mobile = window.innerWidth <= 768;

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
    vertical,
    isMobile: mobile,
  });

  // BRAND DISCOVERY
  renderVis({
    id: "vis-brand-discovery",
    component: VisBrandDiscovery,
    vertical,
    isMobile: mobile,
  });

  // SERVICE DISRUPTION
  csv(`${REPO_URL}/data/data_service_disruption.csv`).then((rawData) => {
    const filteredData = rawData.filter((d) => d.Vertical === vertical);
    if (filteredData.length > 0) {
      const verticalData = filteredData[0];

      if (vertical === "FinTech" || vertical === "On-Demand") {
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
          vertical,
          variable: "Overall score",
          data: verticalData["Overall score"],
          isMobile: mobile,
        });
        renderVis({
          id: "vis-service-disruption-total-label",
          component: VisServiceDisruption,
          vertical,
          variable: "Disruption value",
          data: verticalData["Disruption value"],
          isMobile: mobile,
        });
      }

      if (vertical === "Retail & Ecommerce") {
        // render each variable's vis
        renderVis({
          id: "vis-service-disruption-total-vis",
          component: VisServiceDisruption,
          variable: "Overall score vis",
          data: verticalData["Overall score"],
          isMobile: mobile,
        });
      }
    }
  });

  // CUSTOMER RELATIONSHIPS
  csv(`${REPO_URL}/data/data_customer_relationships.csv`).then((rawData) => {
    const filteredData = rawData.filter((d) => d.Vertical === vertical);
    if (filteredData.length > 0) {
      const verticalData = filteredData[0];

      renderVis({
        id: "vis-customer-relationship-acquisition-strength",
        component: VisCustomerRelationships,
        vertical,
        variable: "Acquisition strength",
        data: verticalData["Acquisition strength"],
        isMobile: mobile,
      });
      renderVis({
        id: "vis-customer-relationship-sustained-loyalty",
        component: VisCustomerRelationships,
        vertical,
        variable: "Sustained loyalty",
        data: verticalData["Sustained loyalty"],
        isMobile: mobile,
      });
      renderVis({
        id: "vis-customer-relationship-platform-engagement-depth",
        component: VisCustomerRelationships,
        vertical,
        variable: "Platform engagement depth",
        data: verticalData["Platform engagement depth"],
        isMobile: mobile,
      });
    }
  });

  // NUMBER BARS ("The Learning Window")

  if (vertical === "Retail & Ecommerce") {
    renderVis({
      id: "vis-number-bars-learning-window-1",
      component: VisNumberBars,
      vertical,
      data: 86,
      average: 76,
      isMobile: mobile,
    });
    renderVis({
      id: "vis-number-bars-learning-window-2",
      component: VisNumberBars,
      vertical,
      data: 36,
      average: 67,
      isMobile: mobile,
    });
    renderVis({
      id: "vis-number-bars-learning-window-3",
      component: VisNumberBars,
      vertical,
      data: 5,
      average: 25,
      isMobile: mobile,
    });
  }
}
