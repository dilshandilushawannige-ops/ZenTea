import axios from 'axios'
import React, { useEffect, useState } from 'react'

const WeatherWidget = () => {
    const [data, setData] = useState({
        celcius: 0,
        name: "none",
        humidity: 0,
        wind: 0,
        description: ""
    });
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Popular Sri Lankan cities
    const sriLankanCities = [
        'Colombo', 'Kandy', 'Galle', 'Jaffna', 'Negombo', 
        'Anuradhapura', 'Trincomalee', 'Batticaloa', 'Matara', 'Kurunegala'
    ];

    const fetchWeatherData = async (cityName) => {
        if (!cityName.trim()) return;
        
        setLoading(true);
        setError('');
        
        try {
            const apiKey = import.meta.env.VITE_WEATHER_API_KEY;
            if (!apiKey) {
                throw new Error('Weather API key not configured');
            }
            
            const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName},LK&appid=${apiKey}&units=metric`;
            
            const response = await axios.get(apiUrl, {
                timeout: 10000 // 10 second timeout
            });
            
            setData({
                celcius: response.data.main.temp,
                name: response.data.name,
                humidity: response.data.main.humidity,
                wind: response.data.wind.speed,
                description: response.data.weather[0].description
            });
        } catch (err) {
            console.error('Weather API Error:', err);
            if (err.code === 'ECONNABORTED') {
                setError('Request timeout. Please try again.');
            } else if (err.response?.status === 404) {
                setError('City not found. Please check the spelling.');
            } else if (err.response?.status === 401) {
                setError('Weather service unavailable.');
            } else {
                setError('Unable to fetch weather data. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClick = () => {
        fetchWeatherData(name);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleClick();
        }
    };

    const handleCitySelect = (city) => {
        setName(city);
        fetchWeatherData(city);
    };

    // Load default city (Colombo) on component mount
    useEffect(() => {
        fetchWeatherData('Colombo');
    }, []);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-6 shadow-sm w-full max-w-md mx-auto">
            <div className="flex flex-col items-center gap-6 w-full">
                <div className="w-full">
                    <div className="flex items-center gap-2 w-full justify-center mb-3">
                        <input
                            type="text"
                            className="w-full sm:w-80 px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-300"
                            placeholder="Search Sri Lankan cities..."
                            value={name}
                            onChange={e => setName(e.target.value)}
                            onKeyPress={handleKeyPress}
                            disabled={loading}
                        />
                        <button 
                            type="button" 
                            className="p-2 ml-2 rounded-md bg-green-400 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            onClick={handleClick}
                            disabled={loading || !name.trim()}
                        >
                            <img src="/images/search.png" alt="search" className="w-5 h-5" />
                        </button>
                    </div>
                    
                    {/* Quick city selection buttons */}
                    <div className="flex flex-wrap gap-1 justify-center">
                        {sriLankanCities.slice(0, 5).map(city => (
                            <button
                                key={city}
                                onClick={() => handleCitySelect(city)}
                                className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
                                disabled={loading}
                            >
                                {city}
                            </button>
                        ))}
                    </div>
                </div>

                {error && (
                    <div className="w-full p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600 text-center">{error}</p>
                    </div>
                )}

                <div className="flex flex-col items-center text-center w-full">
                    <img src="/images/locationWeather.png" alt="weather" className="w-24 h-24 md:w-28 md:h-28 object-contain mb-2" />
                    
                    {loading ? (
                        <div className="animate-pulse">
                            <div className="h-12 w-32 bg-slate-200 rounded mb-2"></div>
                            <div className="h-4 w-24 bg-slate-200 rounded"></div>
                        </div>
                    ) : (
                        <>
                            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-800">
                                {Math.round(data.celcius)}°C
                            </h1>
                            <h3 className="text-sm text-slate-500 mt-1">{data.name}</h3>
                            {data.description && (
                                <p className="text-xs text-slate-400 capitalize mt-1">{data.description}</p>
                            )}
                        </>
                    )}

                    <div className="mt-4 flex flex-col items-center gap-3 w-full">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <img src="/images/humidity.png" alt="humidity" className="w-5 h-5" />
                            <span>Humidity: {Math.round(data.humidity)}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                            <img src="/images/wind.png" alt="wind" className="w-5 h-5" />
                            <span>Wind: {Math.round(data.wind)} km/h</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default WeatherWidget