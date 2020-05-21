const db = require('./scouting.js');
const alliance_outcome_loader = require('./load_event_alliance_outcomes.js');
const alliance_member_outcome_loader = require('./load_event_alliance_member_outcomes');

function get_events(connection, district_key){
    return new Promise((resolve, reject) =>
        connection.query("SELECT event_code FROM frc_event WHERE district_key = ?", 
                        [district_key],
                        (error, results) =>
                        error 
                        ? reject(error)
                        : resolve(results))
    );
}
function load_outcomes (district_key){
    db.with_connection(connection =>
        get_events(connection, district_key)
        .then(events => {
            Promise.all(events.map(event => {
            alliance_outcome_loader.get_outcomes(event.event_code);
            alliance_member_outcome_loader.get_outcomes(event.event_code);
            })); })
        .then(() => connection.end())
        .catch(error => console.warn("Something went wrong: " + error))
    );
}
if (require.main === module){
    var district_key = (process.argv.length < 3)
        ? (console.error("Missing argument: district_key") || process.exit())
        : process.argv[2];
    load_outcomes(district_key);
}
