require('dotenv').config();
const {
	inquirerMenu,
	pause,
	readInput,
	listPlaces,
} = require('./helpers/inquirer');
const Searchs = require('./models/searchs');

const main = async () => {
	let opt;
	const searchs = new Searchs();

	do {
		opt = await inquirerMenu();

		switch (opt) {
			case 1:
				// Initial mesasge
				const place = await readInput('City: ');
				// Search places,
				const places = await searchs.city(place);
				// Place select,
				const selectedId = await listPlaces(places);
				if (selectedId === '0') continue;
				const selectedPlace = places.find(({ id }) => id === selectedId);

				// Save in DB
				searchs.addHistory(selectedPlace.place);

				// Weather
				const weather = await searchs.placeWeather(
					selectedPlace.lat,
					selectedPlace.lng
				);

				console.log('\nCity info\n'.green);
				console.log('City:', selectedPlace.place);
				console.log('Lat:', selectedPlace.lat);
				console.log('Lng:', selectedPlace.lng);
				console.log('Temp:', weather.temp);
				console.log('Min:', weather.min);
				console.log('Max:', weather.max);
				console.log('description:', weather.desc.green);
				break;
			case 2:
				searchs.capitalLetersHistory.forEach((place, i) => {
					const idx = `${i + 1}.`.green;
					console.log(`${idx} ${place} `);
				});
				break;

			default:
				break;
		}

		if (opt !== 0) await pause();
	} while (opt !== 0);
};

main();
