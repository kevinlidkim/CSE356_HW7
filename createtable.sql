CREATE TABLE electric (
  zip INT,
  eiaid INT,
  utility_name VARCHAR(255),
  state VARCHAR(255),
  service_type VARCHAR(255),
  ownership VARCHAR(255),
  comm_rate DECIMAL(15,14),
  ind_rate DECIMAL(15,14),
  res_rate DECIMAL(15,14)
);

LOAD DATA LOCAL INFILE 'C:/Users/Kevin/Desktop/cse356/homeworks/hw7/iouzipcodes2013.csv' INTO TABLE hw7.electric FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES;

LOAD DATA LOCAL INFILE 'C:/Users/Kevin/Desktop/cse356/homeworks/hw7/test.csv' INTO TABLE hw7.electric FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES;

LOAD DATA LOCAL INFILE '/home/ubuntu/CSE356_HW7/iouzipcodes2013.csv' INTO TABLE hw7.electric FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n' IGNORE 1 LINES;

LOAD DATA LOCAL INFILE '/home/ubuntu/CSE356_HW7/upto9999.csv' INTO TABLE hw7.electric FIELDS TERMINATED BY ',' LINES TERMINATED BY '\n';