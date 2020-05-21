const tba = require('./tba.js');
const db = require ('./scouting.js');

async function load_outcomes(connection, outcomes) {
     console.log(`Loading ${outcomes.length} outcomes`);
    if (!outcomes) {
	console.error("No outcomes. Are you sure a match has happened?");
	connection.end();
    }
   
    await Promise.all(outcomes.map(outcome => load_outcome(connection, outcome)))
	.then(() => connection.end())
	.catch((err) => console.error("Something went wrong: " + err));
    console.log("done");
}

async function load_outcome(connection, outcome) {
    
    function getAllianceID(outcome, colour) {
	//console.log("getting alliance id for " + outcome.match_number + " " + colour + " at event " + outcome.event_key);
	 return new Promise(
            (resolve, reject) => 
                connection.query(
                    "SELECT a.alliance_id FROM frc_match m " +
			" INNER JOIN alliance a " +
			"    ON a.match_id = m.match_id " +
			"   AND a.alliance_colour = ? " +
                        " WHERE m.match_number = ? " +
                        "   AND m.event_code = ? " +
						"   AND m.match_type = ? " +
						" 	AND m.series = ?", 
                    [colour, outcome.match_number, outcome.event_key, outcome.comp_level, outcome.set_number],
                    (error, results) => 
                        (error)
                        ? reject(error)  // something went wrong
                        : ((!results || results.size == 0) 
                            ? ("Something went wrong. Have you loaded matches for this event?")  // we got results but we don't like them
                            : resolve(results[0].alliance_id))   // we got an id, return it.
                ));
    }

    function insertTeamOutcome(connection, outcome, alliance_id, team_number) {
	return new Promise(
	    (resolve, reject) =>
		connection.query(
			`INSERT INTO tba_alliance_member_outcome (alliance_id,
                                            team_number, 
                                            start_level,
                                            sand_line_cross,
                                            endgame_level,
                                            did_move,
                                            was_there
			) VALUES (?, ?, ?, ?, ?, ?, ?)`,
		    [alliance_id,
		     team_number,
             outcome.score_breakdown[team_number].start_level,
             outcome.score_breakdown[team_number].sand_line_cross,
             outcome.score_breakdown[team_number].endgame_level,
             outcome.score_breakdown[team_number].did_move,
             outcome.score_breakdown[team_number].was_there],
		    (error) => (error)
			?  console.warn(`While inserting alliance_id ${alliance_id} into ${outcome.match_number} team ${team_number}: ${error}`) || reject(error)
		    : resolve()
		)
		);
	}
	//some data takes some parsing
	function reformatOutcome(outcome){
        ["red", "blue"].map(colour => {
            //create array of team numbers instead of keys
            outcome.alliances[colour].team_numbers = [];
    
            outcome.alliances[colour].team_keys.map((key, position) => { 
                outcome.alliances[colour].team_numbers[position] = parseInt(key.substring(3), 10);
                //then use those numbers to set the outcomes, in a new array for each team outcome
                outcome.score_breakdown[outcome.alliances[colour].team_numbers[position]] = {};
                outcome.score_breakdown[outcome.alliances[colour].team_numbers[position]].start_level =
                    outcome.score_breakdown[colour]["preMatchLevelRobot" + (position + 1)] === "None" || 
                    outcome.score_breakdown[colour]["preMatchLevelRobot" + (position + 1)] === "Unknown"
                        ? null
                        : parseInt(outcome.score_breakdown[colour]["preMatchLevelRobot" + (position + 1)].substring(8),10);
                outcome.score_breakdown[outcome.alliances[colour].team_numbers[position]].sand_line_cross =
                    outcome.score_breakdown[colour]["habLineRobot" + (position + 1)] === "None" ||
                    outcome.score_breakdown[colour]["habLineRobot" + (position + 1)] === "Unknown" 
                        ? null
                        : outcome.score_breakdown[colour]["habLineRobot" + (position + 1)].includes("Sandstorm");
                outcome.score_breakdown[outcome.alliances[colour].team_numbers[position]].endgame_level =
                    outcome.score_breakdown[colour]["endgameRobot" + (position + 1)] === "None" 
                        ? 0 
                        : outcome.score_breakdown[colour]["endgameRobot" + (position + 1)] === "Unknown" 
                            ? null
                            : parseInt(outcome.score_breakdown[colour]["endgameRobot" + (position + 1)].substring(8),10);  
                outcome.score_breakdown[outcome.alliances[colour].team_numbers[position]].did_move = 
                    outcome.score_breakdown[outcome.alliances[colour].team_numbers[position]].sand_line_cross != null ? true : false;
                outcome.score_breakdown[outcome.alliances[colour].team_numbers[position]].was_there = 
                    outcome.score_breakdown[outcome.alliances[colour].team_numbers[position]].start_level != null ? true : false;
        })});
        return outcome;	
    }
    outcome = reformatOutcome(outcome);
    return Promise.all(["red", "blue"].map(colour => getAllianceID(outcome, colour)
                       .then(alliance_id => 
                            //since the outcome at this point already contains team numbers, I'm not certain insertTeamOutcome neeeds one as an arg but it's easy this way
                            outcome.alliances[colour].team_numbers.map((team_num) => 
                                insertTeamOutcome(connection, 
                                                  outcome, 
                                                  alliance_id,
                                                  team_num)
                            ))))			      
	.catch(err => console.warn("something went wrong " + err.message));   
}
function get_outcomes (event_code){
	db.with_connection(connection =>  
		tba.all_match_outcomes(event_code, outcomes => {
			console.log("got " + outcomes.length + " outcomes");
			load_outcomes(connection, outcomes)}));
}
if (require.main === module) {
    console.log("running");
    var event_code = (process.argv.length < 3)
        ? (console.error("Missing argument: event_code") || process.exit())
        : process.argv[2];
    get_outcomes(event_code);
    
}
module.exports.get_outcomes = get_outcomes;
