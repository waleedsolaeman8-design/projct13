// Exercise 13: Weather Dashboard
// Write your implementation under each TODO.

const form = document.querySelector('#weather-form');
const results = document.querySelector('#weather-results');
const cityInput = document.querySelector('#city')
// Open-Meteo describes the weather with a number (weather_code).
// describeWeather(code) turns it into text you can show, e.g. describeWeather(3) → 'Overcast'.
const weatherDescriptions = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Freezing fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains',
  80: 'Light showers', 81: 'Showers', 82: 'Heavy showers', 85: 'Snow showers', 86: 'Heavy snow showers',
  95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail'
};
function describeWeather(code) {
  return weatherDescriptions[code] || 'Unknown conditions';
}

async function findCity(name) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1`;
  // TODO: fetch url, check response.ok, return first city or null.
  // Note: when no city matches, the JSON has no "results" property at all.
  const response = await fetch(url)
  if (!response.ok){
    throw new Error ('Failed to fetch city data')
  }
  const data = await response.json()
  if (!data.results || data.results.length === 0) {
    return null
  }
  return data.results[0]
}
async function fetchWeather(latitude, longitude) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&daily=temperature_2m_max,temperature_2m_min&forecast_days=3&timezone=auto`;
  // TODO: fetch, check response.ok and return JSON.
  const response = await fetch(url)
  if (!response.ok){
    throw new Error ('Failed to fetch weather data')
  }
  return await response.json()
}
form.addEventListener('submit', async (event) => {
  event.preventDefault();
  // TODO: validate city, show loading, fetch and render weather, handle errors.
  // Make sure an older, slower search can't replace the result of a newer one
  // (use an AbortController, or a counter that ignores outdated responses).
  const cityName = cityInput.value.trim()
  if(!cityName){
    results.innerHTML = `<p class="error-message">Please enter a city name.</p>`;
    return;
  }
  results.innerHTML = `<p>Loading weather data...</p>`;
  try{
    const city = await findCity(cityName);
  
  if (!city) {
      results.innerHTML = `<p class="error-message">No Results found for "${cityName}".</p>`;
      return;
    }
    const weatherData = await fetchWeather(city.latitude, city.longitude);
    const currentTemp = weatherData.current.temperature_2m;
    const currentWeatherCode = weatherData.current.weather_code;
    const weatherText = describeWeather(currentWeatherCode);
    let forecastHTML = '';
    const daily = weatherData.daily;
    for (let i = 0; i < daily.time.length; i++) {
      const dateStr = daily.time[i];
      const maxTemp = daily.temperature_2m_max[i];
      const minTemp = daily.temperature_2m_min[i];
      
      forecastHTML += `
        <li>
          <strong>${dateStr}</strong>
          <p>${maxTemp}°C / ${minTemp}°C</p>
        </li>
      `;
    }
    results.innerHTML = `
      <h2>${city.name}, ${city.country || ''}</h2>
      <p>${weatherText}</p>
      <p class="temperature">${currentTemp}°C</p>
      <h3>3-Day Forecast</h3>
      <ul class="forecast">
        ${forecastHTML}
      </ul>
    `;}
  catch (error) {
    results.innerHTML = `<p class="error-message">Error loading weather. Please check your network connection.</p>`;
    console.error(error);
  }
});
