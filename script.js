console.log("Viz script loaded");

import { renderVis } from "./js/lib.js";
import { VisBrandDiscovery } from "./js/VisBrandDiscovery.js";
import { VisServiceDisruption } from "./js/VisServiceDisruption.js";

// detect vertical from global config (embed code in head)
customChartsConfig = window.customChartsConfig || {};

renderVis({
  id: "vis-brand-discovery",
  component: VisBrandDiscovery,
  vertical: customChartsConfig.vertical || null,
});

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
