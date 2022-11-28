const orgApiRouter = require('express').Router();
const { mysqlConnection, sqlQuery } = require('../../db.connection');

const jwt = require('jsonwebtoken');
const { expressjwt: jwtmiddle } = require("express-jwt");
const secretKey = 'ORGub3QvtwXMe7jg0JIR7xtSVzvwvHQvQ2J';

orgApiRouter.use(jwtmiddle({ secret: secretKey, algorithms: ['HS256'] }).unless({ path: ['/api/v1/org/login'] }));


orgApiRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = await sqlQuery('SELECT * FROM users WHERE username = ? AND password = ? AND is_active = ?', [username, password, 1]);
        if (user.length > 0) {
            const token = jwt.sign({ username: username, org_id: user[0].org_id }, secretKey, { expiresIn: '1h', algorithm: 'HS256' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

orgApiRouter.get('/users', async (req, res) => {
    try {
        const { org_id } = req.auth;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let users = await sqlQuery('SELECT * FROM users WHERE org_id = ?', [org_id]);
        res.json(users);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

orgApiRouter.get('/me', async (req, res) => {
    try {
        const { username, org_id } = req.auth;
        let user = await sqlQuery('SELECT * FROM users WHERE username = ? AND org_id = ?', [username, org_id]);
        res.json(user[0]);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



orgApiRouter.get('/machines', async (req, res) => {
    try {
        const { org_id } = req.auth;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let machines = await sqlQuery('SELECT * FROM organisation_systems WHERE org_id = ?', [org_id]);
        res.json(machines);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// users = `id`, `name`, `username`, `email`, `password`, `role`, `profile_pic`, `org_id`, `is_active`, `created_at`

// Create a new user
orgApiRouter.post('/users', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { name, username, email, password, role, profile_pic } = req.body;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let user = await sqlQuery('INSERT INTO users (name, username, email, password, role, profile_pic, org_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [name, username, email, password, role, profile_pic, org_id, 1]);
        res.json(user);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a user
orgApiRouter.post('/users/:id', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { id } = req.params;
        const { name, username, email, password, role, profile_pic } = req.body;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let user = await sqlQuery('UPDATE users SET name = ?, username = ?, email = ?, password = ?, role = ?, profile_pic = ? WHERE id = ? AND org_id = ?', [name, username, email, password, role, profile_pic, id, org_id]);
        res.json(user);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a user
orgApiRouter.get('/users/:id/delete', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { id } = req.params;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let user = await sqlQuery('DELETE FROM users WHERE id = ? AND org_id = ?', [id, org_id]);
        res.json(user);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// `visitors`(`visitor_id`, `org_id`, `name`, `designation`, `email`, `is_active`)

// list all visitors
orgApiRouter.get('/visitors', async (req, res) => {
    try {
        const { org_id } = req.auth;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        let visitors = await sqlQuery('SELECT * FROM visitors WHERE org_id = ?', [org_id]);
        res.json(visitors);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// Create a new visitor
orgApiRouter.post('/visitors', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { name, designation, email } = req.body;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let visitor = await sqlQuery('INSERT INTO visitors (org_id, name, designation, email, is_active) VALUES (?, ?, ?, ?, ?)', [org_id, name, designation, email, 1]);
        res.json(visitor);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a visitor
orgApiRouter.post('/visitors/:id', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { id } = req.params;
        const { name, designation, email } = req.body;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let visitor = await sqlQuery('UPDATE visitors SET name = ?, designation = ?, email = ? WHERE visitor_id = ? AND org_id = ?', [name, designation, email, id, org_id]);
        res.json(visitor);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a visitor
orgApiRouter.get('/visitors/:id/delete', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { id } = req.params;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let visitor = await sqlQuery('DELETE FROM visitors WHERE visitor_id = ? AND org_id = ?', [id, org_id]);

        res.json(visitor);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// update visitor status
orgApiRouter.get('/visitors/:id/update_status', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { id } = req.params;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        // fetch current status
        let visitor_status = await sqlQuery(`SELECT is_active FROM visitors WHERE visitor_id = ? AND org_id = ? LIMIT 1`, [id, org_id])
        if (visitor_status.length == 0) { return res.status(400).send({ error: true, message: 'Visitor not found' }) }
        let is_active = visitor_status[0].is_active == 1 ? 0 : 1;
        let visitor = await sqlQuery('UPDATE visitors SET is_active = ? WHERE visitor_id = ? AND org_id = ?', [is_active, id, org_id]);
        res.json(visitor);

    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


//  `rfidcards`(`RFID_no`, `org_id`, `visitor_id`, `is_active`, `created_at`)

// list all rfidcards
orgApiRouter.get('/rfidcards', async (req, res) => {
    try {
        const { org_id } = req.auth;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        // fetch rfID cards with visitor details

        let rfidcards = await sqlQuery('SELECT rfidcards.*, visitors.name as holder_name, visitors.designation as holder_desg, visitors.email as holder_email FROM rfidcards LEFT JOIN visitors ON rfidcards.visitor_id = visitors.visitor_id WHERE rfidcards.org_id = ?', [org_id]);

        res.json(rfidcards);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// rfid card by id
orgApiRouter.get('/rfidcards/:id', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { id } = req.params;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        // fetch rfID cards with visitor details

        let rfidcard = await sqlQuery('SELECT rfidcards.*, visitors.name as holder_name, visitors.designation as holder_desg, visitors.email as holder_email FROM rfidcards LEFT JOIN visitors ON rfidcards.visitor_id = visitors.visitor_id WHERE rfidcards.org_id = ? AND rfidcards.RFID_no = ?', [org_id, id]);
        if(rfidcard.length == 0) { return res.status(200).send({ error: true, message: 'RFID Card not found' }) }

        res.json({error: false, data: rfidcard[0]});
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// issue card

orgApiRouter.post('/rfidcards/issue', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { holder_id, RFID_no } = req.body;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        // check if card is already issued
        let card = await sqlQuery('SELECT * FROM rfidcards WHERE RFID_no = ? AND org_id = ?', [RFID_no, org_id]);
        if(card.length > 0) { return res.status(200).send({ error: true, message: 'RFID Card already issued' }) }

        // issue card
        let rfidcard = await sqlQuery('INSERT INTO rfidcards (RFID_no, org_id, visitor_id, is_active) VALUES (?, ?, ?, ?)', [RFID_no, org_id, holder_id, 1]);
        res.json(rfidcard);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// update card status

orgApiRouter.get('/rfidcards/:id/update_status', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { id } = req.params;
        // Check if organization is active

        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        // check if card is already issued
        let card = await sqlQuery('SELECT * FROM rfidcards WHERE RFID_no = ? AND org_id = ?', [id, org_id]);
        if(card.length == 0) { return res.status(200).send({ error: true, message: 'RFID Card not found' }) }

        // update card status
        let rfidcard = await sqlQuery('UPDATE rfidcards SET is_active = ? WHERE RFID_no = ? AND org_id = ?', [card[0].is_active == 1 ? 0 : 1, id, org_id]);
        res.json(rfidcard);

    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});




// `gates`(`gate_id`, `org_id`, `gate_name`, `is_active`)

orgApiRouter.get('/gates', async (req, res) => {
    try {
        const { org_id } = req.auth;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        let gates = await sqlQuery('SELECT * FROM gates WHERE org_id = ?', [org_id]);
        res.json(gates);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Create a new gate
orgApiRouter.post('/gates', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { gate_name } = req.body;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let gate = await sqlQuery('INSERT INTO gates (org_id, gate_name, is_active) VALUES (?, ?, ?)', [org_id, gate_name, 1]);
        res.json(gate);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Update a gate
orgApiRouter.post('/gates/:id', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { id } = req.params;
        const { gate_name } = req.body;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let gate = await sqlQuery('UPDATE gates SET gate_name = ? WHERE gate_id = ? AND org_id = ?', [gate_name, id, org_id]);
        res.json(gate);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Delete a gate
orgApiRouter.get('/gates/:id/delete', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { id } = req.params;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }
        
        let gate = await sqlQuery('DELETE FROM gates WHERE gate_id = ? AND org_id = ?', [id, org_id]);
        res.json(gate);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// `devices`(`device_id`, `gate_id`, `org_id`, `DevicePath`, `device_type`)

// get all devices
orgApiRouter.get('/devices', async (req, res) => {
    try {
        const { org_id } = req.auth;
        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        let devices = await sqlQuery('SELECT * FROM devices WHERE org_id = ?', [org_id]);
        res.json(devices);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


// `readerlogs`(`log_id`, `RFID_no`, `gate_id`, `org_id`, `visitor_id`, `device_info`, `type`, `created_at`) 

// get all logs
orgApiRouter.get('/reader_logs', async (req, res) => {
    try {
        const { org_id } = req.auth;
        const { date } = req.query;

        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return res.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        if (date) {
            let logs = await sqlQuery('SELECT * FROM readerlogs WHERE org_id = ? AND DATE(created_at) = ? ORDER BY created_at DESC', [org_id, date]);
        }
        else {
            let logs = await sqlQuery('SELECT * FROM readerlogs WHERE org_id = ? ORDER BY created_at DESC LIMIT 100', [org_id]);
        }
        res.json(logs);
    } catch (error) {
        // console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// generate report
orgApiRouter.get('/report', async (req, response) => {
    try {
        const { org_id } = req.auth;
        let sdate = req.query.sdate
        let edate = req.query.edate
        let date = req.query.date
        let designation = req.query.designation
        let visitor_id = req.query.visitor_id

        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return response.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        if (!date) { date = new Date().toISOString().slice(0, 10) }
        if (date.length != 10 || isNaN(Date.parse(date)) ) { return response.status(400).send({ error: true, message: 'Invalid Date Given' }) }

        if (!sdate && !edate) {sdate = date;edate = date;}
        if((!sdate && edate) || (sdate && !edate)){
            return response.status(400).send({ error: true, message: 'sdate and edate both required' })
        }
        
        if (sdate.length != 10 || edate.length != 10 || isNaN(Date.parse(sdate)) || isNaN(Date.parse(edate)) || Date.parse(sdate) > Date.parse(edate)) {
            return response.status(400).send({ error: true, message: 'Invalid Date Range Given' })
        }
        // if edate is greator than today
        if (Date.parse(edate) > Date.now()) { 
            return response.status(400).send({ error: true, message: 'Invalid Date Range Given' })
        }

        qFilter = "";
        QDATA = [org_id, sdate, edate]
        if(designation && designation!="" && designation!="all"){
            qFilter += ` AND visitors.designation = ?`
            QDATA.push(designation)
        }
        else{
            qFilter += ` AND true = ?`
            QDATA.push(true)
        }

        if(visitor_id && visitor_id!="" && visitor_id!="all"){
            if(isNaN(visitor_id)){
                return response.status(400).send({ error: true, message: 'Invalid Visitor id given' })
            }
            qFilter += ` AND visitors.visitor_id = ?`
            QDATA.push(visitor_id)
        }
        else{
            qFilter += ` AND true = ?`
            QDATA.push(true)
        }


        // Get logs group by date and visitor
    //     let logs = await sqlQuery(`SELECT *,log.created_at as dt FROM readerlogs as log 
    // JOIN visitors ON (log.visitor_id = visitors.visitor_id) 
    // JOIN gates ON (log.gate_id = gates.gate_id) 
    // WHERE log.org_id = ? and DATE(log.created_at) = ?  ORDER BY visitors.created_at ASC`, [org_id, date])

        let logs = await sqlQuery(`SELECT
        DATE(readerlogs.created_at) as log_date,
        RFID_no,
        visitors.name,
        visitors.designation,
        readerlogs.visitor_id,
        TIME(FIRST_IN) as FIRST_IN,
        TIME(LAST_IN) as LAST_IN,
        TOTAL_IN,
        TIME(FIRST_OUT) as FIRST_OUT,
        TIME(LAST_OUT) as LAST_OUT,
        TOTAL_OUT,
        -- TIME(TIME(LAST_OUT) - TIME(FIRST_IN)) as TOTAL_TIME
        (OUTQ.LAST_OUT - INQ.FIRST_IN) as TOTAL_TIME
            FROM readerlogs 
            
                LEFT JOIN (
                    SELECT 
                    MIN(created_at) as FIRST_IN, 
                    MAX(created_at) as LAST_IN,
                    COUNT(created_at) as TOTAL_IN,
                    visitor_id 
                        FROM readerlogs 
                            WHERE type="IN" GROUP BY DATE(created_at),visitor_id
                ) as INQ ON DATE(FIRST_IN) = DATE(readerlogs.created_at) AND INQ.visitor_id = readerlogs.visitor_id
                
                LEFT JOIN (
                    SELECT 
                    MIN(created_at) as FIRST_OUT,
                    MAX(created_at) as LAST_OUT,
                    COUNT(created_at) as TOTAL_OUT,
                    visitor_id 
                        FROM readerlogs 
                            WHERE type="OUT" GROUP BY DATE(created_at),visitor_id
                ) as OUTQ ON DATE(LAST_OUT) = DATE(readerlogs.created_at) AND OUTQ.visitor_id = readerlogs.visitor_id
        
                LEFT JOIN visitors on (readerlogs.visitor_id = visitors.visitor_id)
            
            WHERE 
                readerlogs.org_id = ? 
                AND DATE(readerlogs.created_at) BETWEEN ? AND ? 
                ${qFilter} 
            
            GROUP BY DATE(readerlogs.created_at),readerlogs.visitor_id
            ORDER BY readerlogs.created_at DESC, readerlogs.visitor_id ASC`, QDATA)

        return response.status(200).send(logs);


        // // Create csv
        // let csv = 'Visitor Id,Name,Designation,RFID No,Time In,Time Out,Gate, ENTRY_COUNT, EXIT COUNT\r\n'
        // masterLogs.forEach(log => {
        //     csv += log.visitor_id + ',' + log.name + ',' + log.designation + ',' + log.RFIDNO + ',' + log.TIME_IN + ',' + log.TIME_OUT + ',' + log.GATE + ',' + log.ENTRY_COUNT + ',' + log.EXIT_COUNT + '\r\n'
        // });

        // response.setHeader('Content-disposition', 'attachment; filename=visitor_logs.csv');
        // response.set('Content-Type', 'text/csv');
        // response.status(200).send(csv);
    } catch (error) {
        console.log(error);
        response.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = orgApiRouter;