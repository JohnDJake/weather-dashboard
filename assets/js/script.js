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
            const current = weatherResponse.current;
            
            // Set the title based off the location info from OpenCage and the date from OpenWeather
            $("#title-today").text(`${coordResult.components.city}, ${coordResult.components.state_code},  ${coordResult.components["ISO_3166-1_alpha-3"]} (${DateTime.fromSeconds(current.dt).toLocaleString()})`);

            // Set the icon for the current weather and set title and alt text to the description
            $("#icon-today").attr("src", `https://openweathermap.org/img/wn/${current.weather[0].icon}.png`);
            $("#icon-today").attr("alt", current.weather[0].description);
            $("#icon-today").attr("title", current.weather[0].description);

            // Display today's weather
            $("#temp-today").text(current.temp);
            $("#humidity-today").text(current.humidity);
            $("#wind-today").text(current.wind_speed);
            $("#UV-today").text(current.uvi);
            // UV badge color depends on the UV
            if (current.uvi < 3) $("#UV-today").addClass("badge-success");
            else if (current.uvi < 6) $("#UV-today").addClass("badge-warning");
            else $("#UV-today").addClass("badge-danger");


            // Display the forecast
            // looping from 1 to five because those are the relevent indices in the weatherResponse.daily object and the numbers I used in my reference classes
            for (var i = 1; i <= 5; i++) {
                const forecast = weatherResponse.daily[i];

                // Set the title to the date
                $(`.card-title.day${i}`).text(DateTime.fromSeconds(forecast.dt).toLocaleString());

                // Display the weather icon and set title and alt text to the description
                $(`.forecast-icon.day${i}`).attr("src", `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`);
                $(`.forecast-icon.day${i}`).attr("alt", forecast.weather[0].description);
                $(`.forecast-icon.day${i}`).attr("title", forecast.weather[0].description);

                // Display the forecast info
                $(`.forecast-temp.day${i}`).text(forecast.temp.max);
                $(`.forecast-humidity.day${i}`).text(forecast.humidity);
            }
        });
    });

}


$(document).ready(function () {
    updateWeather("Seattle");

    $("#search-form").submit(function(event) {
        event.preventDefault();
        updateWeather($("#city-search").val());
        $("#city-search").val("");
    })
})