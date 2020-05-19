const tba = require('./tba.js');
const db = require('./scouting.js');

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
                        
async function load_teams(){
    district_keys.map(district_key =>
        db.with_connection(connection =>
            tba.all_teams_from_district(district_key, teams => add_teams(connection, teams))
        )
    )
}

async function add_teams(connection, teams){
    await Promise.all(teams.map(team => add_team(connection, team)))
                .then(connection.end())
                .catch(error => console.error(error));
}

async function add_team(connection, team_object) {
	console.log(team_object.team_number + " "  + team_object.nickname);
	return new Promise((resolve, reject) =>
		connection.query('INSERT INTO team (team_number, name) VALUES(?, ?) ON DUPLICATE KEY UPDATE team_number = team_number',
					 [team_object.team_number, team_object.nickname],
					 (error =>
						error
						? reject(error)
						: resolve())
						)
	);
}

if (require.main === module){
    load_teams();
}