const DateTime = luxon.DateTime;

function updateWeather(city) {
    // Get the geographic coordinates from the OpenCage Geocoding API to pass to the OpenWeather Map onecall API
    $.ajax({
        url: `https://api.opencagedata.com/geocode/v1/json?key=92f5df1355c8480eabe387e3cb8b8bbf&q=${city}&limit=1&no_annotations=1`,
        method: "GET"
    }).then(function (coordResponse) {
        const coordResult = coordResponse.results[0];
        // Get the weather data using the coordinates from OpenCage
        $.ajax({
            url: `https://api.openweathermap.org/data/2.5/onecall?lat=${coordResult.geometry.lat}&lon=${coordResult.geometry.lng}&exclude=minutely,hourly,alerts&units=imperial&appid=d299da3abaf6094099f1ec02d54a1339`,
            method: "GET"
        }).then(function (weatherResponse) {
            // Set the title based off the location info from OpenCage and the date from OpenWeather
            $("#title-today").text(`${coordResult.components.city}, ${coordResult.components.state_code},  ${coordResult.components["ISO_3166-1_alpha-3"]} (${DateTime.fromSeconds(weatherResponse.current.dt).toLocaleString()})`);
            console.log(weatherResponse);

            // Display today's weather
            $("#temp-today").text(weatherResponse.current.temp);
            $("#humidity-today").text(weatherResponse.current.humidity);
            $("#wind-today").text(weatherResponse.current.wind_speed);
            $("#UV-today").text(weatherResponse.current.uvi);
            if (weatherResponse.current.uvi < 3) $("#UV-today").addClass("badge-success");
            else if (weatherResponse.current.uvi < 6) $("#UV-today").addClass("badge-warning");
            else $("#UV-today").addClass("badge-danger");
        });
    });

}


$(document).ready(function () {
    updateWeather("Seattle");
})