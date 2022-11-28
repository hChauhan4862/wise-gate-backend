const adminApiRouter = require('express').Router();
const { mysqlConnection, sqlQuery } = require('../../db.connection');

const jwt = require('jsonwebtoken');
const { expressjwt: jwtmiddle } = require("express-jwt");
const secretKey = 'SAub3QvtwXMe7jg0JIR7xtSVzvwvHQvQ2J';

adminApiRouter.use(jwtmiddle({ secret: secretKey, algorithms: ['HS256'] }).unless({ path: ['/api/v1/sa/login'] }));


adminApiRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        let user = await sqlQuery('SELECT * FROM superadmins WHERE username = ? AND password = ? AND is_active = ?', [username, password, 1]);
        if (user.length > 0) {
            const token = jwt.sign({ username: username, org_id: user[0].org_id }, secretKey, { expiresIn: '30m', algorithm: 'HS256' });
            res.json({ token });
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// `organisations`(`org_id`, `name`, `is_active`)

adminApiRouter.get('/organisations', async (req, res) => {
    try {
        let orgs = await sqlQuery('SELECT * FROM organisations');
        res.json(orgs);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

adminApiRouter.post('/organisations', async (req, res) => {
    try {
        const { name } = req.body;
        let org = await sqlQuery('INSERT INTO organisations (name) VALUES (?)', [name]);
        res.json(org);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

adminApiRouter.post('/organisations/:org_id', async (req, res) => {
    try {
        const { org_id } = req.params;
        const { name } = req.body;
        let org = await sqlQuery('UPDATE organisations SET name = ? WHERE org_id = ?', [name, org_id]);
        res.json(org);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

adminApiRouter.get('/organisations/:org_id/delete', async (req, res) => {
    try {
        const { org_id } = req.params;
        let org = await sqlQuery('DELETE FROM organisations WHERE org_id = ?', [org_id]);
        res.json(org);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = adminApiRouter;

