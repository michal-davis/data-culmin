Based on FRC team Arctos 6135's prototype scouting database (https://github.com/Arctos6135/scouting-database), modified for a Data Management project on predictors of performance in the 2019 FRC game. Not intended for use in scouting, and not affiliated with the team. 

**Installation**  

Install node
Install mysql

In MySql workbench, run schema.sql (to create db and tables)

```npm install``` 
Then, in the client folder do another ```npm install``` 


You need a The Blue Alliance API Key. If you want to use your own, edit that line in `tba.js`

To prepare the database, run these from the command line. They are configured for the Ontario District, you will have to make some changes to use them elsewhere. 
`node load_teams.js`
`node load_events.js`
`node load_matches.js EVENT` (e.g. 2019oncmp1)
`node parse_output.js`
`node load_alliance_outcomes.js EVENT` (e.g. 2019oncmp1)

To run the webapp, run `npm start`. It will open in your default browser at ports 3000(client) and 3001(server).