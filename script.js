  // OpenWeatherMap API key (Replace with your own key)
const API_KEY = "Enter Your Own API Key";

// HTML Elements
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const cityInput = document.getElementById('cityInput');
const weatherDetails = document.getElementById('weatherDetails');
const extendedForecast = document.getElementById('extendedForecast');
const errorDiv = document.getElementById('error');

// Search by city
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        fetchWeatherByCity(city);
    } else {
        showError("Please enter a valid city name.");
    }
});

// Get current location weather
currentLocationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            fetchWeatherByCoordinates(lat, lon);
        }, () => {
            showError("Unable to access your location.");
        });
    } else {
        showError("Geolocation is not supported by this browser.");
    }
});

// Fetch weather by city name
function fetchWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    fetchWeatherData(url);
}

// Fetch weather by geographic coordinates
function fetchWeatherByCoordinates(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    fetchWeatherData(url);
}

// Fetch data from the API and update UI
function fetchWeatherData(url) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === 200) {
                updateWeatherDetails(data);
                fetchExtendedForecast(data.coord.lat, data.coord.lon);
            } else {
                showError(data.message);
            }
        })
        .catch(() => showError("Unable to fetch data. Please try again later."));
}

// Update weather details in the UI
function updateWeatherDetails(data) {
    weatherDetails.classList.remove('hidden');
    errorDiv.classList.add('hidden');
    const locationName = `${data.name}, ${data.sys.country}`;
    const temperature = `Temperature: ${data.main.temp}°C`;
    const humidity = `Humidity: ${data.main.humidity}%`;
    const wind = `Wind Speed: ${data.wind.speed} m/s`;

    document.getElementById('location').innerText = locationName;
    document.getElementById('currentWeather').innerText = temperature;
    document.getElementById('humidity').innerText = humidity;
    document.getElementById('wind').innerText = wind;
}

// Fetch extended forecast (5-day forecast)
function fetchExtendedForecast(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
    fetch(url)
        .then(response => response.json())
        .then(data => updateExtendedForecast(data.list))
        .catch(() => showError("Unable to fetch extended forecast."));
}

// Update extended forecast in the UI
function updateExtendedForecast(forecasts) {
    extendedForecast.classList.remove('hidden');
    extendedForecast.innerHTML = '';

    // Loop through forecast data (every 3 hours forecast)
    forecasts.forEach((forecast, index) => {
        if (index % 8 === 0) {
            const date = new Date(forecast.dt_txt).toDateString();
            const temp = `Temp: ${forecast.main.temp}°C`;
            const wind = `Wind: ${forecast.wind.speed} m/s`;
            const humidity = `Humidity: ${forecast.main.humidity}%`;
            const weatherIcon = forecast.weather[0].icon;
            const iconUrl = `http://openweathermap.org/img/wn/${weatherIcon}@2x.png`;

            const forecastCard = document.createElement('div');
            forecastCard.classList.add('bg-white', 'p-4', 'rounded', 'shadow-md', 'text-center');

            forecastCard.innerHTML = `
                <h3 class="font-semibold">${date}</h3>
                <img src="${iconUrl}" alt="Weather Icon">
                <p>${temp}</p>
                <p>${wind}</p>
                <p>${humidity}</p>
            `;
            extendedForecast.appendChild(forecastCard);
        }
    });
}

// Show error message in the UI
function showError(message) {
    errorDiv.classList.remove('hidden');
    errorDiv.innerText = message;
    weatherDetails.classList.add('hidden');
    extendedForecast.classList.add('hidden');
}