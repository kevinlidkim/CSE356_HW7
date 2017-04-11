// modules =================================================
var express        = require('express');
var app            = express();
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var fs = require("fs");

var port = process.env.PORT || 80; // set our port


// get all data/stuff of the body (POST) parameters
app.use(bodyParser.json()); // parse application/json 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
app.use(bodyParser.urlencoded({ extended: true })); // parse application/x-www-form-urlencoded

app.use(methodOverride('X-HTTP-Method-Override')); // override with the X-HTTP-Method-Override header in the request. simulate DELETE/PUT
app.use(express.static(__dirname + '/public')); // set the static files location /public/img will be /img for users

// routes ==================================================
// require('./app/routes')(app); // pass our application into our routes

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'cse356!@',
  database : 'hw7'
});

var Memcached = require('memcached');
var memcached = new Memcached('127.0.0.1:11211');

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

var query_string = 'SELECT AVG(comm_rate), AVG(ind_rate), AVG(res_rate) FROM electric WHERE `state` = ? AND `service_type` = ?'

app.post('/hw7', function(req, res) {

  var key = req.body.state + "_" + req.body.service_type;

  if (req.body.state) {
    if (req.body.service_type) {

      console.log('');

      memcached.touch(key, 60, function(err) {
        if (err) {
          console.log('touched key error')
          console.log(err);

          return res.status(500).json({
            status: 'error',
            error: 'memcached error'
          })

        } else {
          console.log('touched key success');
          memcached.get(key, function(error, data) {
            if (error) {
              console.log('error getting key');
              console.log(error);

              connection.query({
                sql: query_string,
                values: [req.body.state, req.body.service_type]
              }, function(error, results, fields) {
                if (error) {
                  console.log('error querying mysql');
                  console.log(error);
                  return res.status(500).json({
                    status: 'error',
                    error: 'failed to query'
                  })
                } else {
                  var obj = results[0];
                  memcached.set(key, obj, 60, function(err_set) {
                    if (err_set) {
                      console.log('error setting key');
                      console.log(err_set)
                      return res.status(500).json({
                        status: 'error',
                        error: 'error setting key'
                      })
                    } else {
                      return res.status(200).json({
                        status: 'OK',
                        comm_rate_avg: results[0]['AVG(comm_rate)'],
                        ind_rate_avg: results[0]['AVG(ind_rate)'],
                        res_rate_avg: results[0]['AVG(res_rate)']
                      })
                    }
                  })
                }
              })

            } else {

              console.log('successfully got key');

              if (data) {
                console.log('we should be getting item from memcached here');
                console.log(data);
                return res.status(200).json({
                  status: 'OK',
                  data: data
                })
              } else {

                console.log('get key was undefined');

                connection.query({
                  sql: query_string,
                  values: [req.body.state, req.body.service_type]
                }, function(error, results, fields) {
                  if (error) {
                    console.log('error querying mysql');
                    console.log(error);
                    return res.status(500).json({
                      status: 'error',
                      error: 'failed to query'
                    })
                  } else {
                    var obj = results[0];
                    memcached.set(key, obj, 60, function(err_set) {
                      if (err_set) {
                        console.log('error setting key');
                        console.log(err_set)
                        return res.status(500).json({
                          status: 'error',
                          error: 'error setting key'
                        })
                      } else {
                        return res.status(200).json({
                          status: 'OK',
                          comm_rate_avg: results[0]['AVG(comm_rate)'],
                          ind_rate_avg: results[0]['AVG(ind_rate)'],
                          res_rate_avg: results[0]['AVG(res_rate)']
                        })
                      }
                    })
                  }
                })

              }

              

            }
          })
        }
      })


    } else {
      return res.status(500).json({
        status: 'error',
        error: 'invalid fields'
      })
    }
  } else {
    return res.status(500).json({
      status: 'error',
      error: 'invalid fields'
    })
  }
})


// start app ===============================================
app.listen(port); 
console.log('\nServer hosted on port ' + port);       // shoutout to the user
exports = module.exports = app;             // expose app