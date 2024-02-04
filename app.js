const form = document.querySelector('[data-js="form"]')
const card = document.querySelector('[data-js="card"]')
const dayNightImg = document.querySelector('[data-js="day-night"]')
const weatherIcon = document.querySelector('[data-js="icon"]')
const cityText = document.querySelector('[data-js="city"]')
const weatherText = document.querySelector('[data-js="weather"]')
const temp = document.querySelector('[data-js="temperature"]')
const logo = document.querySelector('[data-js="logo"]')

const apiKey = import.meta.env.VITE_API_KEY
const getCityURL = city => `https://dataservice.accuweather.com/locations/v1/cities/search?apikey=${apiKey}&q=${city}`
const getWeatherUrl = cityKey => `https://dataservice.accuweather.com/currentconditions/v1/${cityKey}?apikey=${apiKey}`

const errorMessage = document.createElement("h2")
errorMessage.innerText = "City not found, please try again"

// check if there is something in local storage, if so remove he logo from screen
if (localStorage.getItem("cityName")) logo.remove()

const getCityInfos = async city => {
   try {
      logo.remove()
      const responseFetchCity = await fetch(getCityURL(city))
      
      // get the first array of several obtained, usually the first is the correct one
      const [responseJsonCity] = await responseFetchCity.json()
      
      const cityKey = responseJsonCity.Key
      const cityName = responseJsonCity.LocalizedName
      return [cityKey, cityName]
   } catch(error) {
      // insert "errorMessage" (h2) element into DOM
      form.appendChild(errorMessage)
      card.remove()
      localStorage.clear()

      // reload the page to original state after 2 secs with no card in screen, no data in local storage
      setTimeout(() => location.reload(), 2000)
   }   
}

const insertCityInfosIntoDOM = async (cityKey, cityName) => {
   // get weather data 
   const responseFetchWeather = await fetch(getWeatherUrl(cityKey))
   const [responseJsonWeather] = await responseFetchWeather.json()
   
   // insert weather data into DOM
   const isDay = responseJsonWeather.IsDayTime
   const icon = responseJsonWeather.WeatherIcon
   const weather = responseJsonWeather.WeatherText
   const temperature = responseJsonWeather.Temperature.Metric.Value
   
   isDay ? dayNightImg.src = `./public/day.svg` : dayNightImg.src = `./public/night.svg`
   weatherIcon.src = `./public/icons/${icon}.svg`
   cityText.textContent = cityName
   weatherText.textContent = weather
   temp.textContent = `${temperature} C`

   // remove the class that hides the card on screen
   card.classList.remove("hidden")
}

const checkCityInLocalStorage = () => {
   if (localStorage.getItem("cityName")) {
      const cityKey = localStorage.getItem("cityKey")
      const cityName = localStorage.getItem("cityName")

      insertCityInfosIntoDOM(cityKey, cityName)
   }
}

form.addEventListener("submit", async e => {
   e.preventDefault()

   // also possible to get Japan's cities only, in kanji.
   const city = e.target.inputCity.value
   const [cityKey, cityName] = await getCityInfos(city)

   insertCityInfosIntoDOM(cityKey, cityName)
   
   localStorage.setItem("cityKey", cityKey)
   localStorage.setItem("cityName", city)

   e.target.reset()
})

checkCityInLocalStorage()
