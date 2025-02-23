const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const app = express();
const PORT = 3003;

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
const OPENWEATHER_API_KEY = '753222a21028ece93d1018ae047c40bd';
const OPENCAGE_API_KEY = 'cb914d317d22411299c7c9989a896c35';
const UNSPLASH_API_KEY = 'wIXQYbPF8_AvgBeoUNbLeD5Vok_YbFmKmAt4A9HH-JQ';

app.use(express.static(path.join(__dirname, 'static')));

app.get('/weather', async (req, res) => {
    const city = req.query.city || 'London';
    try {

        const geocodeResponse = await axios.get(
            `https://api.opencagedata.com/geocode/v1/json?q=${city}&key=${OPENCAGE_API_KEY}&language=en`
        );
        const geocodeData = geocodeResponse.data;
        if (geocodeData.results.length === 0) {
            return res.json({ error: 'Could not find city coordinates.' });
        }

        const { lat, lng } = geocodeData.results[0].geometry;

        const weatherResponse = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=en`
        );
        const weatherData = weatherResponse.data;

        if (weatherData.cod !== 200) {
            return res.json({ error: 'Error fetching weather data.' });
        }

        const photosResponse = await axios.get(
            `https://api.unsplash.com/search/photos?query=${city}&client_id=${UNSPLASH_API_KEY}&per_page=5`
        );
        const photosData = photosResponse.data;

        res.json({
            city: weatherData.name,
            countryCode: weatherData.sys.country,
            temperature: weatherData.main.temp,
            feelsLike: weatherData.main.feels_like,
            humidity: weatherData.main.humidity,
            pressure: weatherData.main.pressure,
            windSpeed: weatherData.wind.speed,
            coordinates: { lat, lon: lng },
            description: weatherData.weather[0].description,
            icon: weatherData.weather[0].icon,
            rain: weatherData.rain ? weatherData.rain['3h'] : 0,
            photos: photosData.results.map(photo => photo.urls.small)
        });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
