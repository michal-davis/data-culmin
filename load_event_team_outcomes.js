const tba = require('./tba.js');
const db = require ('./scouting.js');

async function load_outcomes(connection, outcomes, rankings, teams, event_code) {
     console.log(`Loading ${outcomes.length} outcomes`);
    if (!outcomes) {
	console.error("No outcomes");
	connection.end();
    }
    
    await Promise.all(teams.map((team => load_outcome(connection, outcomes, rankings, team, event_code))))
	.then(() => connection.end())
	.catch((err) => console.error("Something went wrong: " + err));
    console.log("done");
}

async function load_outcome(connection, outcomes, rankings, team, event_code) {

    function insertTeamOutcome(connection, outcomes, team_ranking, team, event_code) {
	return new Promise(
	    (resolve, reject) =>
		connection.query(
			`INSERT INTO team_at_event (team_number,
                                        event_code,
                                        qual_rank,
                                        total_rps,
                                        qual_dps,
                                        selection_dps,
                                        playoff_dps,
                                        performance_district_points
			) VALUES (?, ?, ?, ?, ?, ?, ?, qual_dps + selection_dps + playoff_dps)`,
            [team.team_number,
             event_code,
             team_ranking.rank,
             team_ranking.extra_stats[0],
             outcomes.points[team.key].qual_points,
             outcomes.points[team.key].alliance_points,
             outcomes.points[team.key].elim_points
            ],
		    (error) => (error)
			?  console.warn(`While inserting team ${team.team_number}: ${error}`) || reject(error)
		    : resolve()
		)
		);
	}
    return insertTeamOutcome(connection, 
                        outcomes, 
                        rankings.rankings.reduce((team_data, this_team) => 
                            team_data = this_team.team_key == team.key ? this_team : team_data),
                        team, 
                        event_code)		      
	.catch(err => console.warn("something went wrong " + err.message));   
}
function get_outcomes (event_code){
    db.with_connection(connection => 
        tba.teams_at_event(event_code, teams => 
            tba.event_team_rankings(event_code, rankings =>
            tba.all_event_team_outcomes(event_code, outcomes => {
                console.log("got " + outcomes.length + " outcomes");
                load_outcomes(connection, outcomes, rankings, teams, event_code)
            })))); 
}
if (require.main === module) {
    console.log("running");
    var event_code = (process.argv.length < 3)
        ? (console.error("Missing argument: event_code") || process.exit())
        : process.argv[2];
    get_outcomes(event_code);
}
module.exports.get_outcomes = get_outcomes;
