//# Load all Ontario teams into the scouting db
//this is expected to run only once per season

const tba = require('./tba.js');
const db = require('./scouting.js');


//I got these manually. Could call districts/{year} but not really necessary
const district_keys = ["2019chs", 
						"2019fim", 
						"2019fma", 
						"2019fnc",
						"2019in", 
						"2019isr",
						"2019ne",
						"2019ont",
						"2019pch",
						"2019pnw",
						"2019tx"];

//# Using connection to database, add team_number with name
function add_team(connection) {
	return ((team_object) => {
	console.log(team_object.team_number + " "  + team_object.nickname);
	connection.query('INSERT INTO team (team_number, name) VALUES(?, ?) ON DUPLICATE KEY UPDATE team_number = team_number',
					 [team_object.team_number, team_object.nickname],
					 function (error) {
						 if (error) {
							 throw error;
						 }
					 });
	});
}

/* function is_Ontario(x) {
	return x.state_prov == "Ontario";
} */

if (require.main === module) {
	db.with_connection(connection =>
					   district_keys.forEach(district_key => 
							tba.each_team_from_district(district_key, add_team(connection))
							)
						);
}
