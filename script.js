console.log("Viz script loaded");

import { renderVis } from "./js/lib.js";
import { VisQuadrant } from "./js/VisQuadrant.js";
import { VisBrandDiscovery } from "./js/VisBrandDiscovery.js";
import { VisServiceDisruption } from "./js/VisServiceDisruption.js";
import { VisCustomerRelationships } from "./js/VisCustomerRelationships.js";

// detect vertical from global config (embed code in head)
customChartsConfig = window.customChartsConfig || {};

// QUADRANT
renderVis({
  id: "vis-quadrant",
  component: VisQuadrant,
  vertical: customChartsConfig.vertical || null,
});

// BRAND DISCOVERY
renderVis({
  id: "vis-brand-discovery",
  component: VisBrandDiscovery,
  vertical: customChartsConfig.vertical || null,
});

// SERVICE DISRUPTION
renderVis({
  id: "vis-service-disruption-disintermediation",
  component: VisServiceDisruption,
  vertical: customChartsConfig.vertical || null,
  variable: "Disintermediation",
});
renderVis({
  id: "vis-service-disruption-data-standardization",
  component: VisServiceDisruption,
  vertical: customChartsConfig.vertical || null,
  variable: "Data standardization",
});
renderVis({
  id: "vis-service-disruption-regulatory-shield",
  component: VisServiceDisruption,
  vertical: customChartsConfig.vertical || null,
  variable: "Regulatory shield",
});
// TODO: replace summary text in Webflow

// CUSTOMER RELATIONSHIPS
renderVis({
  id: "vis-customer-relationship-acquisition-strength",
  component: VisCustomerRelationships,
  vertical: customChartsConfig.vertical || null,
  variable: "Acquisition strength",
});
renderVis({
  id: "vis-customer-relationship-sustained-loyalty",
  component: VisCustomerRelationships,
  vertical: customChartsConfig.vertical || null,
  variable: "Sustained loyalty",
});
renderVis({
  id: "vis-customer-relationship-platform-engagement-depth",
  component: VisCustomerRelationships,
  vertical: customChartsConfig.vertical || null,
  variable: "Platform engagement depth",
});
