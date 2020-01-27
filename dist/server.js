var express = require('express'), bodyParser = require('body-parser'), morgan = require('morgan'), port = process.env.PORT || 5000;
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(morgan('common'));
app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});
var knex = require('knex')({
    client: 'mssql',
    connection: {
        host: '127.0.0.1',
        user: 'DBUser',
        password: '12345USERforDB',
        database: 'ProgAssistant'
    }
});
// knex('Answers')
// .select('Id')
// .then((answers)=> console.log(answers)); 
app.listen(port, function () { return console.log('Server has been started...'); });
//# sourceMappingURL=server.js.map