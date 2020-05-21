// API for The Blue Alliance
// See https://www.thebluealliance.com/apidocs/v3

const https = require('https');

const endpoint = "https://www.thebluealliance.com/api/v3";

// This is my API key.
// Maybe should read from process.env to see if user has a different key?
const api_key = "sX6YAEFTW4k2ovNN9IQKRhwFe5XArlokFHUU899aK6Vr4ZlbiA4tq36R4gKEmh6h";

function api_options() {
	return {"headers": 
			{"X-TBA-Auth-Key": api_key}};
}

async function all_teams_from_district(district_key, team_handler) {
	tba_api_call("/" + "district/" + district_key + "/" + "teams/" + "simple",
		team_handler);
}

// Get all the events for district 
// Call event_handler for each one.
// no_more_events is a function (of no args) called after all events have been read
function all_events_in_district(district_key, event_handler) {
	tba_api_call("/" + "district/" + district_key + "/events/simple", event_handler);
}

// Get all the matches for the specified event_code
// call the match_handler with the list of all matches at that event.
function matches_at_event(event_code, match_handler) {
    tba_api_call("/event/" + event_code + "/matches/simple", match_handler);
}

function all_match_outcomes(event_code, outcome_handler) {
    tba_api_call("/event/" + event_code + "/matches", outcome_handler);
}
function all_event_team_outcomes(event_code, outcome_handler) {
	tba_api_call("/event/" + event_code + "/district_points", outcome_handler)
}
function teams_at_event (event_code, team_handler) {
	tba_api_call("/event/" + event_code + "/teams/simple", team_handler);
}
function event_team_rankings (event_code, ranking_handler) {
	tba_api_call("/event/" + event_code + "/rankings", ranking_handler);
}

//this unified caller will call the data_handler up to once
//whoever calls it can choose to break the array up or keep it together
async function tba_api_call(url_arguments, data_handler){
	var url = endpoint+url_arguments;
	//console.log(url);
	https.get(url,
			api_options(),
			(response) =>{
				let reply = "";
				response.on('data', (chunk) => {
					reply += chunk;
				});

				response.on('end', () => data_handler(JSON.parse(reply)));
			}).on('error', (err)=> {
				console.error(err);
			});
}
module.exports.all_teams_from_district = all_teams_from_district;
module.exports.all_events_in_district = all_events_in_district;
module.exports.matches_at_event = matches_at_event;
module.exports.all_match_outcomes = all_match_outcomes;
module.exports.all_event_team_outcomes = all_event_team_outcomes;
module.exports.teams_at_event = teams_at_event;
module.exports.event_team_rankings = event_team_rankings;
//module.exports.tba_api_call = tba_api_call;