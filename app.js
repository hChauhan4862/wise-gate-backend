const express = require('express');
var app = express();
const bodyparser = require('body-parser');
const { mysqlConnection, sqlQuery } = require('./db.connection');
const port = 5500

app.use(bodyparser.json());
app.listen(port, () => {console.log('Backend server is running at http://localhost:' + port)});

const machineRouter = require('./router/machine_endpoints');
const publicRouter = require('./router/public_endpoints');
const orgApiRouter = require('./router/V1/org_api');
const adminApiRouter = require('./router/V1/super_admin');
app.use('/', machineRouter);
app.use('/public/', publicRouter);
app.use('/api/v1/org/', orgApiRouter);
app.use('/api/v1/sa/', adminApiRouter);

