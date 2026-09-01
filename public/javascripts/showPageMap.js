maptilersdk.config.apiKey = window.mapToken;

const restaurant = window.restaurantsData;
if (restaurant && restaurant.geometry && Array.isArray(restaurant.geometry.coordinates)) {
  const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.STREETS.PASTEL,
    center: restaurant.geometry.coordinates,
    zoom: 13,
    navigationControl: true
  });
  const popupNode = document.createElement('div');
  popupNode.className = 'map-popup';
  const title = document.createElement('strong');
  title.textContent = restaurant.title;
  const location = document.createElement('p');
  location.textContent = restaurant.location;
  popupNode.append(title, location);
  new maptilersdk.Marker({ color: '#d7664f' })
    .setLngLat(restaurant.geometry.coordinates)
    .setPopup(new maptilersdk.Popup({ offset: 25 }).setDOMContent(popupNode))
    .addTo(map);
}
