import type {} from 'leaflet.markercluster';

declare module 'leaflet' {
  function markerClusterGroup(options?: {
    maxClusterRadius?: number;
    spiderfyOnMaxZoom?: boolean;
    showCoverageOnHover?: boolean;
    disableClusteringAtZoom?: number;
  }): L.LayerGroup & {
    addLayer(layer: L.Layer): L.LayerGroup;
    clearLayers(): L.LayerGroup;
  };
}
