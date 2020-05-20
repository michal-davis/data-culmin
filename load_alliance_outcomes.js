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

    function insertAllianceOutcome(connection, outcome, alliance_id, colour) {
	return new Promise(
	    (resolve, reject) =>
		connection.query(
			`INSERT INTO tba_alliance_outcome (alliance_id,
											score, 
											RP1_rocket, 
											RP2_climbed,
											
											points_from_fouls,
											cargo_points,
											hatch_points,
											climb_points,
											auto_points,
											
											cs_bay1_hatch,
											cs_bay1_cargo,
											cs_bay2_hatch,
											cs_bay2_cargo,
											cs_bay3_hatch,
											cs_bay3_cargo,
											cs_bay4_hatch,
											cs_bay4_cargo,
											cs_bay5_hatch,
											cs_bay5_cargo,
											cs_bay6_hatch,
											cs_bay6_cargo,
											cs_bay7_hatch,
											cs_bay7_cargo,
											cs_bay8_hatch,
											cs_bay8_cargo,
											
											rocket_near_low_hatch,
											rocket_near_low_cargo,
											rocket_near_mid_hatch,
											rocket_near_mid_cargo,
											rocket_near_high_hatch,
											rocket_near_high_cargo,
											
											rocket_far_low_hatch, 
											rocket_far_low_cargo,
											rocket_far_mid_hatch,
											rocket_far_mid_cargo,
											rocket_far_high_hatch,
											rocket_far_high_cargo,
											
											cs_bay1_preload,
											cs_bay2_preload,
											cs_bay3_preload,
											cs_bay6_preload,
											cs_bay7_preload,
											cs_bay8_preload
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
		    [alliance_id,
		     outcome.alliances[colour].score,
		     outcome.score_breakdown[colour].completeRocketRankingPoint,
			 outcome.score_breakdown[colour].habDockingRankingPoint,
			 outcome.score_breakdown[colour].foulPoints,
			 outcome.score_breakdown[colour].cargoPoints,
			 outcome.score_breakdown[colour].hatchPanelPoints,
			 outcome.score_breakdown[colour].habClimbPoints,
			 outcome.score_breakdown[colour].autoPoints,
			 
			 outcome.score_breakdown[colour].cs_bay1_hatch,
 			 outcome.score_breakdown[colour].cs_bay1_cargo,
 			 outcome.score_breakdown[colour].cs_bay2_hatch,
 			 outcome.score_breakdown[colour].cs_bay2_cargo,
 			 outcome.score_breakdown[colour].cs_bay3_hatch,
 			 outcome.score_breakdown[colour].cs_bay3_cargo,
 			 outcome.score_breakdown[colour].cs_bay4_hatch,
 			 outcome.score_breakdown[colour].cs_bay4_cargo,
 			 outcome.score_breakdown[colour].cs_bay5_hatch,
 			 outcome.score_breakdown[colour].cs_bay5_cargo,
 			 outcome.score_breakdown[colour].cs_bay6_hatch,
 			 outcome.score_breakdown[colour].cs_bay6_cargo,
 			 outcome.score_breakdown[colour].cs_bay7_hatch,
 			 outcome.score_breakdown[colour].cs_bay7_cargo,
 			 outcome.score_breakdown[colour].cs_bay8_hatch,
 			 outcome.score_breakdown[colour].cs_bay8_cargo,
 			 
 			 outcome.score_breakdown[colour].rocket_near_low_hatch,
 			 outcome.score_breakdown[colour].rocket_near_low_cargo,
 			 outcome.score_breakdown[colour].rocket_near_mid_hatch,
 			 outcome.score_breakdown[colour].rocket_near_mid_cargo,
 			 outcome.score_breakdown[colour].rocket_near_high_hatch,
 			 outcome.score_breakdown[colour].rocket_near_high_cargo,
											
 			 outcome.score_breakdown[colour].rocket_far_low_hatch, 
 			 outcome.score_breakdown[colour].rocket_far_low_cargo,
 			 outcome.score_breakdown[colour].rocket_far_mid_hatch,
 			 outcome.score_breakdown[colour].rocket_far_mid_cargo,
 			 outcome.score_breakdown[colour].rocket_far_high_hatch,
 			 outcome.score_breakdown[colour].rocket_far_high_cargo,
 			 
 			 outcome.score_breakdown[colour].cs_bay1_preload,
 			 outcome.score_breakdown[colour].cs_bay2_preload,
 			 outcome.score_breakdown[colour].cs_bay3_preload,
 			 outcome.score_breakdown[colour].cs_bay6_preload,
 			 outcome.score_breakdown[colour].cs_bay7_preload,
 			 outcome.score_breakdown[colour].cs_bay8_preload],
		    (error) => (error)
			?  console.warn(`While inserting outcome ${outcome.match_number} into ${alliance_id}: ${error}`) || reject(error)
		    : resolve()
		)
		);
	}
	//some gamepiece data takes some parsing
	function reformatOutcome(outcome){
		["red", "blue"].map(colour => {
			for (let i = 1; i<=8; i++){
				outcome.score_breakdown[colour]["cs_bay" + i + "_preload"] = outcome.score_breakdown[colour]["preMatchBay"+ i] == "Panel" ? "null_hatch"  
																: outcome.score_breakdown[colour]["preMatchBay"+ i] == "Cargo" ? "cargo" : null;
			}
			// this does check for a bay 4 and 5 preload and sets it to null. the inserter fully ignores it so it's ok		
			for (let i = 1; i<=8; i++){
				outcome.score_breakdown[colour]["cs_bay" + i + "_hatch"] = outcome.score_breakdown[colour]["bay" + i].includes("Panel") 
													&& outcome.score_breakdown[colour]["cs_bay" + i + "_preload"] != "null_hatch";
				outcome.score_breakdown[colour]["cs_bay" + i + "_cargo"] = outcome.score_breakdown[colour]["bay" + i].includes("Cargo");
			}
			//the double arrays contain my label (first) and then TBA's label (second). some are the same, some aren't
			[["near", "Near"], ["far", "Far"]].map(thisRocket => 
				[["low", "low"], ["mid", "mid"], ["high", "top"]].map(level => {
				outcome.score_breakdown[colour]["rocket_" + thisRocket[0] + "_" + level[0] + "_hatch"] = 
							outcome.score_breakdown[colour][level[1] +"LeftRocket" + thisRocket[1]].includes("Panel") +
							outcome.score_breakdown[colour][level[1] +"RightRocket" + thisRocket[1]].includes("Panel");
				outcome.score_breakdown[colour]["rocket_" + thisRocket[0] + "_" + level[0] + "_cargo"] = 
							outcome.score_breakdown[colour][level[1] +"LeftRocket" + thisRocket[1]].includes("Cargo") +
							outcome.score_breakdown[colour][level[1] +"RightRocket" + thisRocket[1]].includes("Cargo");
				})
			)
		})
		return outcome;	
	}
    return Promise.all(["red", "blue"].map(colour => getAllianceID(outcome, colour)
					   .then(alliance_id => {
					       //console.log(alliance_id);
					       return insertAllianceOutcome(connection, reformatOutcome(outcome), alliance_id, colour)})))
					  // .then(() => console.log("Entered " + outcome.match_number + " into the database"))))
	.catch(err => console.warn("something went wrong " + err.message));
   
	    
}

if (require.main === module) {
    console.log("running");
    var event_code = (process.argv.length < 3)
        ? (console.error("Missing argument: event_code") || process.exit())
        : process.argv[2];
    console.log(event_code);
    db.with_connection(connection =>  
                       tba.all_alliance_outcomes(event_code, outcomes => {
			   console.log("got " + outcomes.length + " outcomes");
			   load_outcomes(connection, outcomes)}));
}
