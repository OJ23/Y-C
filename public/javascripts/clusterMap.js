maptilersdk.config.apiKey = window.mapToken;

const validRestaurants = (window.restaurantsData || []).filter(item => item.geometry && Array.isArray(item.geometry.coordinates));
const restaurantGeoJSON = {
  type: 'FeatureCollection',
  features: validRestaurants.map(item => ({
    type: 'Feature',
    geometry: item.geometry,
    properties: {
      id: String(item._id),
      title: item.title || 'Restaurant',
      location: item.location || 'Location not listed',
      rating: item.rating || 'New'
    }
  }))
};

window.restaurantMap = new maptilersdk.Map({
  container: 'map',
  style: maptilersdk.MapStyle.STREETS.PASTEL,
  center: validRestaurants.length ? validRestaurants[0].geometry.coordinates : [9.082, 8.6753],
  zoom: validRestaurants.length ? 11 : 4,
  navigationControl: true,
  geolocateControl: true
});

window.restaurantMap.on('load', () => {
  window.restaurantMap.addSource('restaurants', {
    type: 'geojson',
    data: restaurantGeoJSON,
    cluster: true,
    clusterMaxZoom: 14,
    clusterRadius: 48
  });
  window.restaurantMap.addLayer({
    id: 'clusters', type: 'circle', source: 'restaurants', filter: ['has', 'point_count'],
    paint: { 'circle-color': '#174f3b', 'circle-radius': ['step', ['get', 'point_count'], 18, 10, 23, 30, 29], 'circle-stroke-width': 4, 'circle-stroke-color': '#ffffff' }
  });
  window.restaurantMap.addLayer({
    id: 'cluster-count', type: 'symbol', source: 'restaurants', filter: ['has', 'point_count'],
    layout: { 'text-field': '{point_count_abbreviated}', 'text-size': 12 }, paint: { 'text-color': '#ffffff' }
  });
  window.restaurantMap.addLayer({
    id: 'restaurant-point', type: 'circle', source: 'restaurants', filter: ['!', ['has', 'point_count']],
    paint: { 'circle-color': '#d7664f', 'circle-radius': 8, 'circle-stroke-width': 4, 'circle-stroke-color': '#ffffff' }
  });

  window.restaurantMap.on('click', 'clusters', async event => {
    const feature = window.restaurantMap.queryRenderedFeatures(event.point, { layers: ['clusters'] })[0];
    const zoom = await window.restaurantMap.getSource('restaurants').getClusterExpansionZoom(feature.properties.cluster_id);
    window.restaurantMap.easeTo({ center: feature.geometry.coordinates, zoom });
  });
  window.restaurantMap.on('click', 'restaurant-point', event => {
    const feature = event.features[0];
    const popup = document.createElement('div');
    popup.className = 'map-popup';
    const title = document.createElement('strong');
    title.textContent = feature.properties.title;
    const location = document.createElement('p');
    location.textContent = `${feature.properties.location} · ${feature.properties.rating} rating`;
    const link = document.createElement('a');
    link.href = `/restaurants/${feature.properties.id}`;
    link.textContent = 'View restaurant';
    popup.append(title, location, link);
    new maptilersdk.Popup({ offset: 12 }).setLngLat(feature.geometry.coordinates).setDOMContent(popup).addTo(window.restaurantMap);
  });
  ['clusters', 'restaurant-point'].forEach(layer => {
    window.restaurantMap.on('mouseenter', layer, () => { window.restaurantMap.getCanvas().style.cursor = 'pointer'; });
    window.restaurantMap.on('mouseleave', layer, () => { window.restaurantMap.getCanvas().style.cursor = ''; });
  });
});
