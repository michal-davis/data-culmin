Grade 12 Data Management final project, in which I drew on a publicly-available database of all matches and team performances in the [2019 FIRST Robotics Competition game](https://www.firstinspires.org/sites/default/files/uploads/resource_library/frc/game-and-season-info/competition-manual/2019/frc19-fr021-spectator-flyer.pdf) to explore how individual actions in matches correlated with high-level performance. Thousands of datapoints were programmatically accessed, added to a custom SQL database, and then visualized in Tableau. Fairly crude statistical techniques, only slightly above the level the course was taught at, were used to draw conclusions on research questions.
Technologies used: JavaScript, MySQL, Tableau, Node.js

---

Based on FRC team Arctos 6135's prototype scouting database (https://github.com/Arctos6135/scouting-database), modified for a Data Management project on predictors of performance in the 2019 FRC game. Not intended for use in scouting, and not affiliated with the team. 

**Installation**  

Install node
Install mysql

In MySql Workbench, run schema.sql (to create db and tables)

```npm install``` 

You need a The Blue Alliance API Key. If you want to use your own, edit that line in `tba.js`

To access data, run the loaders. 
