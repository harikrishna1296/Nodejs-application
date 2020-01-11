const express = require('express');
const app = express();
const body_parser = require('body-parser')
const mongodb = require('mongodb')
const cors = require('cors')
const session = require('express-session');

app.use(cors());
app.use(body_parser.json());
app.use(session({secret: 'doodleblue',saveUninitialized: true,resave: true}));
app.use(express.static(__dirname + '/upload'));


require('./router_config')(app)

mongodb.connect('mongodb://localhost:27017', { useUnifiedTopology: true }, (err, client) => {
    if (err) console.log(err)
    else {
        app.listen(3000, (err) => {
            if (err) console.log(err)
            else {
                app.locals.db = client.db('doodleblue')
                console.log("Server connected")
            }
        })
    }
})