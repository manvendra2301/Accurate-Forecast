const searchButton=document.querySelector(".search-btn");
const cityInput=document.querySelector(".city-input");
const weathercardDiv=document.querySelector(".weather-card");
const locationButton= document.querySelector(".location-btn");
const currentWeatherDiv=document.querySelector(".current-weather");

const API_KEY="99533e6be52549c9fc1bd981837dd48d";

const createWeatherCard =(cityName, weatherItem, index)=>{

    if(index===0){
        //html for the main weather card 
                       return `<div class="details">
                          <h2>${cityName} (${
                         weatherItem.dt_txt.split(" ")[0]
                       })</h2>
                          <h4>Temperature: ${(
                            weatherItem.main.temp - 273.15
                          ).toFixed(2)}°C</h4>
                          <h4>Wind: ${weatherItem.wind.speed} M/S</h4>
                          <h4>Humidity: ${weatherItem.main.humidity}%</h4>
                        </div>
                        <div class="icon">
                        <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                        <h4>${weatherItem.weather[0].description}</h4>
                        
                        </div>`;
                        
    }
    else{
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@2x.png" alt="">
                    <h4>Temp: ${(weatherItem.main.temp - 273.15).toFixed(2)}°C</h4>
                    <h4>${weatherItem.wind.speed} M/S</h4>
                    <h4>${weatherItem.main.humidity}%</h4>  
                    </li>`;
    }
    
}

 //FOR FIVE DAY FORECAST OF WEATHER 
const getWeatherDetails=(cityName,lat,lon)=>{
    const WEATHER_API_URL =`http://api.openweathermap.org/data/2.5/forecast/?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
    fetch(WEATHER_API_URL).then(res=>res.json()).then(data=>{
        
        //as api is showing weather data of every three hour we have to find the unique dates
        //Filter the forecast to get only one forecast per day

        const uniqueForecastDays=[];

        const fiveDaysForecast=data.list.filter(forecast=>{
            const forecastDate=new Date(forecast.dt_txt).getDate();
            if(!uniqueForecastDays.includes(forecastDate)){
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //clearing previous weather data

        cityInput.value="";
        weathercardDiv.innerHTML="";
        currentWeatherDiv.innerHTML="";

        //creating weather card and adding them to the DOM
        fiveDaysForecast.forEach((weatherItem,index)=>{

            if(index===0){
                currentWeatherDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName,weatherItem,index));
            }
            else{
                 weathercardDiv.insertAdjacentHTML("beforeend",createWeatherCard(cityName,weatherItem,index));
            }
           
        });
    }).catch(()=>{
        alert("An error ocurred while fetching  the coordinates!")
    });
}

const getCityCoordinates = ()=>{
    //get user entered city name and remove extra space 
    const cityName=cityInput.value.trim();
    if(!cityName) return; // return if city name is empty 

    const GEOCODING_API_URL=`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //get entered city coordinates (latitude, longitude, and name) from API response 
    fetch(GEOCODING_API_URL).then(res=>res.json()).then(data=>{
        if(!data.length) return alert(`No coordinates found for ${cityName}`);
        const {name, lat, lon}=data[0];
        //this can be write as 
        // const name=data[0].name;
        // const lat=data[0].lat;
        // const lon=data[0].lon;

        getWeatherDetails (name,lat,lon);
    }).catch(()=>{
        alert("An error ocurred while fetching  the coordinates!")
    });
 
   
}

const getUserCoordinates=()=>{
    navigator.geolocation.getCurrentPosition(
        position =>{
            const{ latitude, longitude}= position.coords;
            const REVERSE_GEOCODING_URL=`http://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

           //Get city name from coordnates using reverse geocoding API 
        
        fetch(REVERSE_GEOCODING_URL).then((res) => res.json()).then((data) => {
            const { name } = data[0];
            getWeatherDetails(name, latitude, longitude);
          })
          .catch(() => {
            alert("An error ocurred while fetching  the city!");
          });

        },
        error =>{
            if(error.code === error.PERMISSION_DENIED){
                alert("Geolocation request denied. Please reset location permission to grant access again ")
            }
        }
    )
}


locationButton.addEventListener("click",getUserCoordinates); 
searchButton.addEventListener("click", getCityCoordinates);

cityInput.addEventListener("keyup",e => e.key === "Enter" && getCityCoordinates());

