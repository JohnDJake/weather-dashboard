const DateTime = luxon.DateTime;

function updateWeather(city) {
    // Get the geographic coordinates from the OpenCage Geocoding API to pass to the OpenWeather Map onecall API
    $.ajax({
        url: `https://api.opencagedata.com/geocode/v1/json?key=92f5df1355c8480eabe387e3cb8b8bbf&q=${city}&limit=1&no_annotations=1`,
        method: "GET"
    }).then(function (coordResponse) {
        // Set the title based off the location info from OpenCage
        $("#title-today").text(`${coordResponse.results[0].components.city}, ${coordResponse.results[0].components.state_code},  ${coordResponse.results[0].components["ISO_3166-1_alpha-3"]}`);
        // Get the weather data using the coordinates from OpenCage
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/onecall?lat=${coordResponse.results[0].geometry.lat}&lon=${coordResponse.results[0].geometry.lng}&exclude=minutely,hourly,alerts&appid=d299da3abaf6094099f1ec02d54a1339`,
            method: "GET"
        }).then(function (weatherResponse) {
            console.log(weatherResponse);
        });
    });

}


$(document).ready(function () {
    updateWeather("Seattle");
})