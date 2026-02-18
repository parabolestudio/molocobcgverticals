console.log("Viz script loaded");

import { renderVis } from "./js/lib.js";
import { VisBrandDiscovery } from "./js/VisBrandDiscovery.js";

// detect vertical from global config (embed code in head)
customChartsConfig = window.customChartsConfig || {};

renderVis({
  id: "vis-brand-discovery",
  component: VisBrandDiscovery,
  vertical: customChartsConfig.vertical || null,
});
