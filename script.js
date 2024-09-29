// OpenWeatherMap API key (Replace with your own key)
const API_KEY = "edb6bee1c9cd64b405d0620200a0f5de";

// HTML Elements
const searchBtn = document.getElementById('searchBtn');
const currentLocationBtn = document.getElementById('currentLocationBtn');
const cityInput = document.getElementById('cityInput');
const weatherDetails = document.getElementById('weatherDetails');
const extendedForecast = document.getElementById('extendedForecast');
const errorDiv = document.getElementById('error');
const dropdownBtn = document.getElementById('dropdownBtn');
const recentSearchesDropdown = document.getElementById('recentSearchesDropdown');

// Load recent city names from local storage on page load
window.onload = () => {
    loadRecentSearches();
};

// Search by city
searchBtn.addEventListener('click', () => {
    const city = cityInput.value.trim();
    if (city) {
        addRecentSearch(city);
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

// Add recent search to local storage
function addRecentSearch(city) {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    
    // Add city to the beginning of the array and remove duplicates
    if (!recentSearches.includes(city)) {
        recentSearches.unshift(city);
        if (recentSearches.length > 5) {
            recentSearches.pop(); // Keep only the last 5 searches
        }
        localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }

    loadRecentSearches();
}

// Load recent searches from local storage
function loadRecentSearches() {
    const recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
    recentSearchesDropdown.innerHTML = ''; // Clear previous list

    // Show dropdown if there are recent searches
    if (recentSearches.length > 0) {
        dropdownBtn.classList.remove('bg-gray-200');
        dropdownBtn.classList.add('bg-white', 'border', 'border-gray-300');
        recentSearchesDropdown.classList.remove('hidden');
    } else {
        dropdownBtn.classList.add('bg-gray-200');
        recentSearchesDropdown.classList.add('hidden');
    }

    recentSearches.forEach(city => {
        const listItem = document.createElement('li');
        listItem.innerText = city;
        listItem.classList.add('cursor-pointer', 'hover:bg-gray-100', 'p-2');
        listItem.onclick = () => fetchWeatherByCity(city); // Fetch weather on click
        recentSearchesDropdown.appendChild(listItem);
    });
}

// Toggle dropdown visibility on button click
dropdownBtn.addEventListener('click', () => {
    recentSearchesDropdown.classList.toggle('hidden');
});
