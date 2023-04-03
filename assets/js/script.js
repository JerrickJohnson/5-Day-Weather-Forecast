let cityName = document.querySelector('.weatherCity');
let day = document.querySelector('.weatherDay');

let temperature = document.querySelector('#temperature .value');
let wind = document.querySelector('#wind .value');
let humidity = document.querySelector('#humidity .value');

let fcTemperature = document.querySelector('.weatherForecastTemperature .value');
let fcWind = document.querySelector('.weatherForecastWind .value');
let fcHumidity = document.querySelector('.weatherForecastHumidity .value')
let fcIcon = document.querySelector('.weatherForecastIcon');

let weatherAPIkey = 'e49f15e6d04d892dd8c400c87894b77a';
let weatherBaseEndpoint = 'https://api.openweathermap.org/data/2.5/forecast?q={city name}&appid={API key}';

let searchHistory = [];

// Render the search history list
function renderSearchHistory() {
    const list = document.getElementById('searchHistoryList');
    list.innerHTML = '';
    for (let i = 0; i < searchHistory.length; i++) {
      const li = document.createElement('li');
      const cityName = searchHistory[i];
      li.textContent = cityName;
      li.addEventListener('click', () => {
        getWeatherByCityName(cityName);
      });
      list.appendChild(li);
    }
  }

// Save the search history to local storage
function saveSearchHistory() {
    localStorage.setItem('searchHistory', JSON.stringify(searchHistory));
}

// Load the search history from local storage
function loadSearchHistory() {
    const history = localStorage.getItem('searchHistory');
    if (history) {
        searchHistory = JSON.parse(history);
        renderSearchHistory();
    }
}

loadSearchHistory();

async function searchCity(city) {
    const endpoint = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${weatherAPIkey}`;
    const response = await fetch(endpoint);
    if (response.status === 404) {
      alert('Invalid city name. Please enter a valid city name.');
      return;
    }
    getWeatherByCityName(city);
  }

let getWeatherByCityName = async (city) => {

    // Capitalize the first letter of the city name and convert the rest of the letters to lowercase
    city = city.split(' ').map(word => {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }).join(' ');

    if (!searchHistory.includes(city)) {
        searchHistory.push(city);
        saveSearchHistory();
        renderSearchHistory();
      }

    let endpoint = weatherBaseEndpoint.replace('{city name}', city).replace('{API key}', weatherAPIkey);
    let response = await fetch(endpoint);
    let weatherData = await response.json();

    console.log(weatherData);

    // Extract the data from the weatherData

    let currentTemperatureKelvin = weatherData.list[0].main.temp;
    let currentTemperatureFahrenheit = (currentTemperatureKelvin - 273.15) * 9/5 + 32;
    let currentWindSpeed = weatherData.list[0].wind.speed;
    let currentHumidity = weatherData.list[0].main.humidity;
    let currentIconCode = weatherData.list[0].weather[0].icon;

    // update the HTML elements

    cityName.textContent = weatherData.city.name;
    day.textContent = dayjs().format('MMMM DD YYYY');
    temperature.textContent = currentTemperatureFahrenheit.toFixed(0); // round the temperature to the nearest integer;
    wind.textContent = currentWindSpeed;
    humidity.textContent = currentHumidity;
    fcIcon.classList.add(`wi-owm-${currentIconCode}`);

    // update the 5 Day forecast

    for (let i = 1; i < 6; i++) {
        let forecastItem = document.querySelectorAll('.weatherForecastItem')[i - 1];
        let forecastTemperatureKelvin = weatherData.list[i * 8].main.temp;
        let forecastTemperatureFahrenheit = (forecastTemperatureKelvin - 273.15) * 9/5 + 32;
        let forecastWindSpeed = weatherData.list[i * 8].wind.speed;
        let forecastHumidity = weatherData.list[i * 8].main.humidity;
        let forecastIconCode = weatherData.list[i * 8].weather[0].icon;

        forecastItem.querySelector('.weatherForecastDay').textContent = dayjs().add(i, 'days').format('ddd');
        forecastItem.querySelector('.weatherForecastTemperature .value').textContent = forecastTemperatureFahrenheit.toFixed(0);
        forecastItem.querySelector('.weatherForecastWind .value').textContent = forecastWindSpeed;
        forecastItem.querySelector('.weatherForecastHumidity .value').textContent = forecastHumidity;
        forecastItem.querySelector('.weatherForecastIcon').classList.add(`wi-owm-${forecastIconCode}`);
    }
}

// getWeatherByCityName('New York');

let searchForm = document.querySelector('#search');
let searchInput = document.querySelector('#query');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const city = searchInput.value.toLowerCase();
    searchCity(city);
  });