const fs = require('fs');
const { default: axios } = require('axios');

class Searchs {
	history = [];
	dbPath = './DB/database.json';

	constructor() {
		this.readDB();
	}

	get capitalLetersHistory() {
		return this.history.map((place) => {
			let words = place.split(' ');
			words = words.map((w) => w[0].toUpperCase() + w.substring(1));
			return words.join(' ');
		});
	}

	get paramMapbox() {
		return {
			'access_token': process.env.MAPBOX_KEY,
			'limit': 5,
			'language': 'en',
		};
	}
	async city(place = '') {
		try {
			const instance = axios.create({
				baseURL: `https://api.mapbox.com/geocoding/v5/mapbox.places/${place}.json`,
				params: this.paramMapbox,
			});
			// Http request
			const resp = await instance.get();
			return resp.data.features.map((place) => ({
				id: place.id,
				place: place.place_name,
				lng: place.center[0],
				lat: place.center[1],
			}));
		} catch (error) {
			console.log("Didn't find any match with this search params");
			return [];
		}

		return []; //return all the cities that match
	}

	get paramOpenweather() {
		return {
			'appid': process.env.OPENWEATHER_KEY,
			'units': 'metric',
		};
	}

	async placeWeather(lat, lon) {
		try {
			const instance = axios.create({
				baseURL: `https://api.openweathermap.org/data/2.5/weather`,
				params: { ...this.paramOpenweather, lat, lon },
			});
			// Http request
			const resp = await instance.get();
			const { weather, main } = resp.data;
			return {
				desc: weather[0].description,
				min: main.temp_min,
				max: main.temp_max,
				temp: main.temp,
			};
		} catch (error) {
			console.log(error);
		}
	}

	addHistory(place = '') {
		if (this.history.includes(place.toLocaleLowerCase())) {
			return;
		}
		this.history = this.history.splice(0, 5);

		this.history.unshift(place.toLocaleLowerCase());

		// Save in DB
		this.saveDB();
	}

	saveDB() {
		const payload = {
			history: this.history,
		};

		fs.writeFileSync(this.dbPath, JSON.stringify(payload));
	}

	readDB() {
		if (!fs.existsSync(this.dbPath)) return;
		const info = fs.readFileSync(this.dbPath, { enconding: 'utf-8' });
		const data = JSON.parse(info);
		this.history = data.history;
	}
}

module.exports = Searchs;
