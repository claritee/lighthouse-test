-- Create lighthouse metrics table 
CREATE TABLE lighthouse_metrics 
  ( 
     id            UUID NOT NULL PRIMARY KEY, 
     target_domain VARCHAR NOT NULL, 
     path          VARCHAR NOT NULL, 
     metric_type   VARCHAR NOT NULL, 
     metric_value  VARCHAR NOT NULL, 
     commit_hash   VARCHAR NOT NULL, 
     build_number  VARCHAR NOT NULL, 
     created_at    TIMESTAMP NOT NULL, 
  ); 
-- Might need to create indexes later on 
