DROP DATABASE IF EXISTS data_culmin;
CREATE DATABASE data_culmin;
USE data_culmin;

DROP TABLE IF EXISTS team;
CREATE TABLE team (
	team_number INT PRIMARY KEY, 
    team_name VARCHAR(128)
);
DROP TABLE IF EXISTS frc_event;
CREATE TABLE frc_event (
	district_key VARCHAR (32),
	event_code VARCHAR (32) PRIMARY KEY
);
DROP TABLE IF EXISTS frc_match;
CREATE TABLE frc_match (
	match_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    event_code VARCHAR (32),
    match_type ENUM('p', 'qm', 'qf', 'sf', 'f'),
    series INT, -- only meaningful for playoff matches ex. quarterfinal [series] match [match_number]
				-- =1 for qual and practice
	match_number NUMERIC, -- assigned by event scheduler (ex. quals 4 or quarterfinal x match 2)
    CONSTRAINT FOREIGN KEY (event_code) REFERENCES frc_event (event_code) ON DELETE CASCADE,
    UNIQUE(event_code, match_type, series, match_number)
);
DROP TABLE IF EXISTS alliance;
CREATE TABLE alliance (
	alliance_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
	match_id INT,
	alliance_colour ENUM ('red', 'blue'), 
    CONSTRAINT FOREIGN KEY (match_id) REFERENCES frc_match (match_id) ON DELETE CASCADE,
    UNIQUE(match_id, alliance_colour)
);
DROP TABLE IF EXISTS alliance_member; 
CREATE TABLE alliance_member (
	alliance_id INT,
    team_number INT,
    driver_station INT,
    CONSTRAINT FOREIGN KEY (team_number) REFERENCES team (team_number) ON DELETE CASCADE, 
	CONSTRAINT FOREIGN KEY (alliance_id) REFERENCES alliance (alliance_id) ON DELETE CASCADE,
    UNIQUE (alliance_id, team_number)
);
DROP TABLE IF EXISTS tba_alliance_outcome;
CREATE TABLE tba_alliance_outcome (
	alliance_id INT NOT NULL,
	
    -- basic data
    score NUMERIC,
    RP1_rocket BOOLEAN,
    RP2_climbed BOOLEAN,
    
    -- point breakdown
    points_from_fouls INT,
    cargo_points INT,
    hatch_points INT,
    climb_points INT,
    auto_points INT,
    
    -- placement breakdown
    cs_bay1_hatch BOOLEAN,
	cs_bay1_cargo BOOLEAN,
	cs_bay2_hatch BOOLEAN,
	cs_bay2_cargo BOOLEAN,
	cs_bay3_hatch BOOLEAN,
	cs_bay3_cargo BOOLEAN,
	cs_bay4_hatch BOOLEAN,
	cs_bay4_cargo BOOLEAN,
	cs_bay5_hatch BOOLEAN,
	cs_bay5_cargo BOOLEAN,
	cs_bay6_hatch BOOLEAN,
	cs_bay6_cargo BOOLEAN,
	cs_bay7_hatch BOOLEAN,
	cs_bay7_cargo BOOLEAN,
	cs_bay8_hatch BOOLEAN,
	cs_bay8_cargo BOOLEAN,
    
    -- ints because there's two ports
    rocket_near_low_hatch INT, 
	rocket_near_low_cargo INT,
	rocket_near_mid_hatch INT,
	rocket_near_mid_cargo INT,
    rocket_near_high_hatch INT,
	rocket_near_high_cargo INT,
    
    rocket_far_low_hatch INT, 
	rocket_far_low_cargo INT,
	rocket_far_mid_hatch INT,
	rocket_far_mid_cargo INT,
    rocket_far_high_hatch INT,
	rocket_far_high_cargo INT,
	
    -- preloads
    -- bay 4 and 5 are omitted because they always have cargo 
    cs_bay1_preload ENUM("null_hatch", "cargo"),
	cs_bay2_preload ENUM("null_hatch", "cargo"),
    cs_bay3_preload ENUM("null_hatch", "cargo"),
    cs_bay6_preload ENUM("null_hatch", "cargo"),
    cs_bay7_preload ENUM("null_hatch", "cargo"),
    cs_bay8_preload ENUM("null_hatch", "cargo"),
    
    CONSTRAINT FOREIGN KEY (alliance_id) REFERENCES alliance (alliance_id) ON DELETE CASCADE,
    UNIQUE (alliance_id)
);

DROP TABLE IF EXISTS tba_alliance_member_outcome;
CREATE TABLE tba_alliance_member_outcome (
	alliance_id INT,
    team_number INT,
    
    start_level INT,
    sand_line_cross BOOLEAN,
    endgame_level INT,
    did_move BOOLEAN DEFAULT TRUE,
    was_there BOOLEAN DEFAULT TRUE,
    
    CONSTRAINT FOREIGN KEY (team_number) REFERENCES team (team_number) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (alliance_id) REFERENCES alliance (alliance_id) ON DELETE CASCADE,
    UNIQUE (alliance_id, team_number)
);

-- denormalized view of the matches with all teams in all alliances
CREATE OR REPLACE VIEW denormalized_schedule AS
 SELECT m.match_id, 
		m.event_code, 
        m.match_type, 
        m.series, 
        m.match_number, 
        
        red.alliance_id AS 'red_alliance_id',
        r1.team_number AS 'red1_team_number', 
        r2.team_number AS 'red2_team_number', 
        r3.team_number AS 'red3_team_number', 
        
        blue.alliance_id AS 'blue_alliance_id',
        b1.team_number AS 'blue1_team_number', 
        b2.team_number AS 'blue2_team_number', 
        b3.team_number AS 'blue3_team_number'
	FROM frc_match m
    INNER JOIN alliance red ON 
		m.match_id = red.match_id 
        AND red.alliance_colour = 'red'
    INNER JOIN alliance_member r1 ON 
		red.alliance_id = r1.alliance_id 
        AND r1.driver_station = 1
    INNER JOIN alliance_member r2 ON 
		red.alliance_id = r2.alliance_id 
        AND r2.driver_station = 2
	INNER JOIN alliance_member r3 ON 
		red.alliance_id = r3.alliance_id 
        AND r3.driver_station = 3
	
    INNER JOIN alliance blue ON
		m.match_id = blue.match_id
        AND blue.alliance_colour = 'blue'
    INNER JOIN alliance_member b1 ON 
		blue.alliance_id = b1.alliance_id 
        AND b1.driver_station = 1
	INNER JOIN alliance_member b2 ON 
		blue.alliance_id = b2.alliance_id 
        AND b2.driver_station = 2
	INNER JOIN alliance_member b3 ON 
		blue.alliance_id = b3.alliance_id 
        AND b3.driver_station = 3;

DROP TABLE IF EXISTS team_at_event;    
CREATE TABLE team_at_event (
	team_number INT NOT NULL,
    event_code VARCHAR (32) NOT NULL,
    qual_rank INT,
    total_rps INT,
    performance_district_points INT, -- ie all but awards
    qual_dps INT,
    selection_dps INT,
    playoff_dps INT,
    CONSTRAINT FOREIGN KEY (team_number) REFERENCES team (team_number) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (event_code) REFERENCES frc_event (event_code) ON DELETE CASCADE,
    UNIQUE (team_number, event_code)
);
 -- not currently in use 
 DROP TABLE IF EXISTS alliance_member_outcome;
CREATE TABLE alliance_member_outcome (
	alliance_id INT NOT NULL,
    team_number INT NOT NULL, 
	start_level	INT,
	sand_cs_hatch INT,
	sand_r1_hatch INT,
	sand_r2_hatch INT,
	sand_r3_hatch INT,
	sand_cs_cargo INT,
	sand_r1_cargo INT,
	sand_r2_cargo INT,
	sand_r3_cargo INT,

	tele_cs_hatch	INT,
	tele_r1_hatch	INT,
	tele_r2_hatch	INT,
	tele_r3_hatch	INT,
	tele_cs_cargo	INT,
	tele_r1_cargo	INT,
	tele_r2_cargo	INT,
	tele_r3_cargo	INT,

	defense_time	NUMERIC,
	assist_level	INT,
	climb_level	    INT,
	tipped			BOOLEAN,
	broke			BOOLEAN,
	floor_hatch		BOOLEAN,
	dropped_hatch	INT,
    penalties       INT,

    CONSTRAINT FOREIGN KEY (alliance_id) REFERENCES alliance (alliance_id) ON DELETE CASCADE,
    CONSTRAINT FOREIGN KEY (team_number) REFERENCES alliance_member (team_number) ON DELETE CASCADE,
    UNIQUE (alliance_id, team_number)
);
