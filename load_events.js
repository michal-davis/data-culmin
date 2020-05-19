//# Load all Ontario events into the db
//this is expected to run only once per season

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

async function load_events (connection, events) {
    if (!events) {
	console.log("No events in that district");
	connection.end();
    }
    console.log(`Loading ${events.length} events`);
    await Promise.all(events.map(event => add_event(connection, event.key)))
	.then(() => connection.end())
	.catch((err) => console.error("Something went wrong: " + err));
    console.log("done");
}

//# Using connection to database, add event_code
async function add_event(connection, event_code) {
    console.log(event_code);
    return new Promise(
	(resolve, reject) => 
	    connection.query("INSERT INTO frc_event (event_code) " +
			     "VALUES(?) " +
			     "ON DUPLICATE KEY UPDATE event_code = event_code",
			     [event_code],
			     ((error, results, fields) => {
				 (error)
				     ? reject(error)
				     : resolve()    
			     }
			     )
			    )
	
    );
}
	

if (require.main === module) {
    district_keys.map(district_key => db.with_connection(
	connection =>
	    tba.all_events_in_district(district_key, events => load_events(connection, events)
			  )));
}
