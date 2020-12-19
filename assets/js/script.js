const DateTime = luxon.DateTime;
var searchHistory;

// Class for my location objects that includes a method to check if it is equal to a new search
class Location {
    constructor(display, coords) {
        this.display = display;
        this.coords = coords;
    }

    equals(other) {
        return other.display == this.display && other.coords.lat == this.coords.lat && other.coords.lng == this.coords.lng;
    }
}

// Get the weather data using one of my location objects, search using the stored coords and display the stored name
function updateWeather(location) {
    // Store this as the last searched location
    localStorage.setItem("weatherSearchLast", JSON.stringify(location));

    // Call the OpenWeather API
    $.ajax({
        url: `https://api.openweathermap.org/data/2.5/onecall?lat=${location.coords.lat}&lon=${location.coords.lng}&exclude=minutely,hourly,alerts&units=imperial&appid=d299da3abaf6094099f1ec02d54a1339`,
        method: "GET"
    }).then(function (weatherResponse) {
        const current = weatherResponse.current;

        // Set the title based off the stored location info and the date from OpenWeather
        $("#title-today").text(`${location.display} (${DateTime.fromSeconds(current.dt).setZone(weatherResponse.timezone).toLocaleString()})`);

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
        $("#UV-today").removeClass("badge-success badge-warning badge-danger");
        if (current.uvi < 3) $("#UV-today").addClass("badge-success");
        else if (current.uvi < 6) $("#UV-today").addClass("badge-warning");
        else $("#UV-today").addClass("badge-danger");


        // Display the forecast
        // looping from 1 to five because those are the relevent indices in the weatherResponse.daily object and the numbers I used in my reference classes
        for (var i = 1; i <= 5; i++) {
            const forecast = weatherResponse.daily[i];

            // Set the title to the date
            $(`.card-title.day${i}`).text(DateTime.fromSeconds(forecast.dt).setZone(weatherResponse.timezone).toLocaleString());

            // Display the weather icon and set title and alt text to the description
            $(`.forecast-icon.day${i}`).attr("src", `https://openweathermap.org/img/wn/${forecast.weather[0].icon}.png`);
            $(`.forecast-icon.day${i}`).attr("alt", forecast.weather[0].description);
            $(`.forecast-icon.day${i}`).attr("title", forecast.weather[0].description);

            // Display the forecast info
            $(`.forecast-temp.day${i}`).text(forecast.temp.max);
            $(`.forecast-humidity.day${i}`).text(forecast.humidity);
        }
    });
}

function searchCity(city) {
    // Get the geographic coordinates and proper name from the OpenCage Geocoding API
    $.ajax({
        url: `https://api.opencagedata.com/geocode/v1/json?key=92f5df1355c8480eabe387e3cb8b8bbf&q=${city}&limit=1&no_annotations=1`,
        method: "GET"
    }).then(function (coordResponse) {
        const coordResult = coordResponse.results[0];
        // Make sure we found a valid city
        // TODO use Bootstrap alert instead of vanilla JS alert
        if (coordResult === undefined) {
            alert("We couldn't find a valid city from that search");
        } else {
            // City name formatted to display and store
            var cityProperName = "";
            // not all results will have city/town/village and state_code/state values, only add if they exist
            if (coordResult.components.city !== undefined) { cityProperName += coordResult.components.city + ", "; }
            else if (coordResult.components.town !== undefined) { cityProperName += coordResult.components.town + ", "; }
            else if (coordResult.components.village !== undefined) { cityProperName += coordResult.components.village + ", "; }
            if (coordResult.components.state_code !== undefined) { cityProperName += coordResult.components.state_code + ", "; }
            else if (coordResult.components.state !== undefined) { cityProperName += coordResult.components.state + ", "; }
            // results should always have a country code, add that
            cityProperName += coordResult.components["ISO_3166-1_alpha-2"];

            const resultLocation = new Location(cityProperName, coordResult.geometry);

            // check if we already have this location in the search history and add it if we don't
            if (!searchHistory.reduce((found, location) => found || location.equals(resultLocation), false)) {
                searchHistory.push(resultLocation);
                localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
                displayHistory();
            }

            // Display the weather
            updateWeather(resultLocation);
        }
    })
}

function displayHistory() {
    // Empty the list-group
    $("#history-list").empty();

    // Loop through search history
    for (var i = 0; i < searchHistory.length; i++) {
        // Create button group div, assign class, and append to the list
        var group = $("<div>").addClass("btn-group").appendTo("#history-list");
        // Create button, add classes, set text, set data-index value, and append to the group
        $("<button>").addClass("btn btn-light bg-white text-left col-10 history").text(searchHistory[i].display)
            .attr("data-index", i).appendTo(group);
        // Create delete button, add classes, set text, set data-index value, and append to the group
        $("<button>").addClass("btn btn-secondary col-2 delete").html("&times;").attr("data-index", i).appendTo(group);
    }
}

$(document).ready(function () {
    // Get the stored search history and convert into my Location objects, then display
    searchHistory = (JSON.parse(localStorage.getItem("weatherSearchHistory")) || []).map(obj => new Location(obj.display, obj.coords));
    displayHistory();

    $("#history-list").on("click", ".history", function (event) {
        updateWeather(searchHistory[parseInt($(this).attr("data-index"))]);
    });

    $("#history-list").on("click", ".delete", function (event) {
        searchHistory.splice(parseInt($(this).attr("data-index")), 1);
        displayHistory();
        localStorage.setItem("weatherSearchHistory", JSON.stringify(searchHistory));
    })

    // If the user has used this weather app before, load their most recent search
    var searchLast = localStorage.getItem("weatherSearchLast");
    if (searchLast !== null) { updateWeather(JSON.parse(searchLast)); }

    $("#search-form").submit(function (event) {
        event.preventDefault();
        // Search for the city with OpenCage
        searchCity($("#city-search").val());
        $("#city-search").val("");
    });

    $(".alert").alert();
})