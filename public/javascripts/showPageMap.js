maptilersdk.config.apiKey = window.mapToken;
console.log(maptilersdk.config.apiKey)
const restaurants = window.restaurantsData
console.log(restaurants.geometry.coordinates)
const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.BRIGHT,
    center: restaurants.geometry.coordinates, // starting position [lng, lat]
    zoom: 10 // starting zoom
});

new maptilersdk.Marker()
    .setLngLat(restaurants.geometry.coordinates)
    .setPopup(
        new maptilersdk.Popup({ offset: 25 })
            .setHTML(
                `<h3>${restaurants.title}</h3><p>${restaurants.location}</p>`
            )
    )
    .addTo(map)