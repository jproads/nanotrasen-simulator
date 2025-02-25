const STARTING_CREDITS = 1000
var stations = []; // I apologize deeply for the sin I have comitted.
let maxStations = 5;
let stationsBought = 0;
let credits = 0 //DO NOT MODIFY
let stationPrice = 1000;
let capacityPrice = 5000;

/**
 * Adds an integer amount of credits
 * @param {number} credits_added 
 */
function addCredits(credits_added) {
	credits += credits_added;
	document.getElementById("credits").textContent = `${credits.toString()}`;
	if (credits > 0) {
		document.getElementById("credits").style.color = "#00aa00"
	} else if (credits < 0) {
		document.getElementById("credits").style.color = "#ff0000"
	} else {
		document.getElementById("credits").style.color = "#000000"
	}
}

/**
 * ALlows you to buy more station capacity for `capacityPrice` amount of credits.
 */
function buyStationCapacity() {
	if (credits >= capacityPrice) {
		addEventLog(loc.formatString("%events.buyStationCapacity", [capacityPrice]), new Station("", 0,0,0,[]), "#00aa00")
		addCredits(-capacityPrice)
		maxStations++;
		capacityPrice = Math.floor(capacityPrice *= 1.5);
		document.getElementById("stationsAmount").innerHTML = `${stationsBought}/${maxStations}`
		document.getElementById("capacityPrice").innerHTML = `(${capacityPrice})`
	}
}

/**
 * Concentrates all the data in memory, into a base64 string
 * @returns base64 string
 */
function exportData() {
	const fullData = {
		stationAmount: 0,
		stationPrice: 0,
		capacityPrice: 0,
		maxStations: 0,
		tickNumber: 0, 
		credits: 0, 
		threat: 20,
		stations: []
	}
	for (let i = 0; i < stations.length; i++) {
		const data = stations[i];
		fullData.stations.push(data);
	}

	fullData.stationAmount = stationsBought;
	fullData.stationPrice = stationPrice;
	fullData.capacityPrice = capacityPrice;
	fullData.tickNumber = tickNumber;
	fullData.credits = credits;
	fullData.maxStations = maxStations;
	fullData.threat = threatLevel;

	return btoa(JSON.stringify(fullData));
}

/**
 * Imports data from a `base64 string` to memory, returns 0 if succeeded, returns 1 if else.
 * @param {base64 string} data 
 */
function importData(data) {
	try {
		const packedData = JSON.parse(atob(data));
		console.log(packedData)
		
		// Actually clear stations.
		while(stations.length > 0) {
			stations.pop();
		}

		for (let i = 0; i < packedData.stations.length; i++) {
			const station = packedData.stations[i];
			addStation(new Station(
				station.name,
				station.revenue,
				station.unrest,
				station.createdOn,
				station.upgrades,
				station.ppc,
				false,false,0
			), false, false);
		}

		stationsBought = packedData.stationAmount
		stationPrice = packedData.stationPrice
		capacityPrice = packedData.capacityPrice
		tickNumber = packedData.tickNumber
		credits = packedData.credits
		threatLevel = packedData.threat
		maxStations = packedData.maxStations

		document.getElementById("stationsAmount").innerHTML = `${stationsBought}/${maxStations}`
		document.getElementById("capacityPrice").innerHTML = `(${capacityPrice})`
		document.getElementById("buyStation").innerHTML = `Buy Station (${stationPrice})`
		document.getElementById("stationsAmount").innerHTML = `${stationsBought}/${maxStations}`
		return 0;
	} catch (e) {
		console.error(e);
		return 1;
	}
}

/**
 * Returns the station index (stations[index]).
 * @param {Number} tickN 
 * @returns station index, else -1
 */
function getStationByTick(tickN) {
	return stations.findIndex(station => station.createdOn == tickN);
}

/**
 * Adds a station to `stations` and adds the corrensponding HTML div
 * @param {Station} station 
 * @param {boolean} sound 
 * @param {boolean} disableButton 
 */
function addStation(station, sound=true, disableButton=true) {
	stations.push(station);
	const div = document.createElement("div")
	div.classList.add('station');
	div.innerHTML = `
	<p class="station_name">Name: ${station.name}</p>
	<p class="station_revenue">Revenue: ${station.revenue}</p>
	<p class="station_unrest">Unrest: ${station.unrest}</p>
	<p class="station_uptime">Uptime: ${station.uptime}</p>
	<p class="station_crew">Crew: 69420</p><br>
	
	<!-- holy shit button hell -->
	<button onclick="stations[getStationByTick('${station.createdOn}')].sellStation()" class="station_sell">Sell Station</button><br>

	<button onclick="stations[getStationByTick('${station.createdOn}')].buyCrew(1)" class="station_crewadd">+</button> Crew (${station.crewmemberPrice}C) 
	<button onclick="stations[getStationByTick('${station.createdOn}')].addCrew(-1)" class="station_crewremove">-</button><br>
	
	<button onclick="stations[getStationByTick('${station.createdOn}')].payPerCrewmember+= 10;" class="station_adddPPC">++</button>
	<button onclick="stations[getStationByTick('${station.createdOn}')].payPerCrewmember++;" class="station_addPPC">+</button>
	<span class="station_ppc">CPPC: 0 | DPPC: 0</span>
	<button onclick="stations[getStationByTick('${station.createdOn}')].payPerCrewmember--;" class="station_remPPC">-</button>
	<button onclick="stations[getStationByTick('${station.createdOn}')].payPerCrewmember-= 10;" class="station_remmPPC">--</button>
	` // Add emergency shuttle status WYCI
	// <p class="station_shuttle">Emergency Shuttle Status: ${station.shuttleStatus}</p>
	document.getElementById("stations").appendChild(div)
	div.id = station.createdOn
	
	if (disableButton) {
		document.getElementById("buyStation").disabled = true
		setTimeout(function(){
			document.getElementById("buyStation").disabled = false
		}, 5000)
	}
	if (sound) {
		try { welcome.play(); } catch {}
	}
}

/**
 * Generates a random station name: Prefix Name Suffix Number
 * @returns string
 */
function generateStationName() {
	const prefix = STATION_PREFIXES[
		Math.floor(Math.random() * (STATION_PREFIXES.length - 1))
	]
	const name = STATION_NAMES[
		Math.floor(Math.random() * (STATION_NAMES.length - 1))
	]
	const suffix = STATION_SUFFIXES[
		Math.floor(Math.random() * (STATION_SUFFIXES.length - 1))
	]
	
	return `${prefix} ${name} ${suffix} ${Math.floor(Math.random() * 1000)}`
}

/**
 * Buy a station for a `stationPrice` amount of price.
 */
function buyStation() {
	// check if we have enough credits and we havent hit the maxcap
	if (credits >= stationPrice && stationsBought < maxStations) {
		// create a new station, this'll be appended
		const station = new Station(generateStationName(), 100, 0, tickNumber, []);

		addStation(station) // add the station+renders
		addEventLog(loc.formatString("%events.buyStation", [stationPrice]), station, "#00aa00")
		addCredits(-stationPrice) // remove credits

		// increase price exponentially
		stationPrice = Math.floor(stationPrice *= 1.25);
		stationsBought++;

		// render
		document.getElementById("buyStation").innerHTML = `Buy Station (${stationPrice})`
		document.getElementById("stationsAmount").innerHTML = `${stationsBought}/${maxStations}`
	}
}

window.addEventListener('load', function () {
	// initialize loc

	// properly set buystation, and add the starting credits
	document.getElementById("buyStation").innerHTML = `Buy Station (${stationPrice})`
	addCredits(STARTING_CREDITS);

	// start the ticking
	tick();

	// load data, create data if not exist
	if (localStorage.getItem("nt_sim_data") == null) {
		localStorage.setItem("nt_sim_data", exportData());
		console.log("Created new data.")
	} else {
		importData(localStorage.getItem("nt_sim_data"))
		console.log("Imported data.")
	}

	console.log("Game initialized.")
})

// Haha. Funny.
console.log('%cHeh. A snooper. Go check out the source code instead of using addCredits(), skid.', 'font-size: 32px; text-shadow: -5px -5px 0 #0019FF, 5px -5px 0 #0019FF, -5px 5px 0 #0019FF, 5px 5px 0 #0019FF;');
console.log('%chttps://github.com/2G2C/nanotrasen-simulator', 'font-size: 16px; text-shadow: -5px -5px 0 #0019FF, 5px -5px 0 #0019FF, -5px 5px 0 #0019FF, 5px 5px 0 #0019FF;');
