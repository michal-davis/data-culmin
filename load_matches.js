const db = require('./scouting.js');
const match_loader = require('./load_event_matches.js');

function get_events(connection){
    return new Promise((resolve, reject) =>
        connection.query("SELECT event_code FROM frc_event", 
                        [],
                        (error, results) =>
                        error 
                        ? reject(error)
                        : resolve(results))
    );
}
function load_matches (){
    db.with_connection(connection =>
        get_events(connection)
        .then(events => {
            console.log(events[0].event_code);
            Promise.all(events.map(event =>
            match_loader.load_matches_at_event(event.event_code)
        )); })
        .then(() => connection.end())
        .catch(error => console.warn("Something went wrong: " + error))
    );
}
if (require.main === module){
    load_matches();
}
module.exports.load_matches = load_matches;
