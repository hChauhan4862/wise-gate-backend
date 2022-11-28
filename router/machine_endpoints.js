const machineRouter = require('express').Router();
const { mysqlConnection, sqlQuery } = require('../db.connection');

// `organisation_systems`(`guid`, `org_id`,`sys_id`, `extra_info`, `is_active`, `created_at`)
machineRouter.post('/:machineId/save', async (req, res) => {
    try {
        const { machineId } = req.params;
        const {data} = req.body;

        data2 = JSON.stringify(data);
        // check if machine exists
        let machine = await sqlQuery('SELECT * FROM organisation_systems WHERE guid = ?', [machineId]);
        if (machine.length > 0) {
            // update extra info
            let uid = machine[0].sys_id;
            let update = await sqlQuery('UPDATE organisation_systems SET extra_info = ? WHERE guid = ?', [data2, machineId]);
        }
        else{
            // create new machine
            // Generate random alphanumeric string of length 10
            let uid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

            let create = await sqlQuery('INSERT INTO organisation_systems (guid, sys_id, extra_info) VALUES (?,?, ?)', [machineId,uid, data2]);
        }
        res.json({ message: 'success', uid: uid });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});



machineRouter.get('/:machineId/gate_list', async (request, response) => {
    try {
        let machineId = request.params.machineId
        // Select orgainization id from organization table
        let org_id = await sqlQuery(`SELECT org_id FROM organisation_systems WHERE guid = ? and is_active = ? LIMIT 1`, [machineId, 1])
        if (org_id.length == 0) { return response.status(400).send({ error: false, message: 'Invalid machine id' }) }
        org_id = org_id[0].org_id

        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return response.status(400).send({ error: false, message: 'Organization Deactivated' }) }

        // Select gate list from gate table
        let gate_list = await sqlQuery(`SELECT gate_id, gate_name FROM gates WHERE org_id = ? and is_active = ?`, [org_id, 1])
        return response.send(gate_list)
    }
    catch (err) {
        // console.log(err)
        return response.status(500).json({ message: 'Internal server error' });
    }
})


machineRouter.get('/:machineId/device_list', async (request, response) => {
    try {
        let machineId = request.params.machineId
        // Select orgainization id from organization table
        let org_id = await sqlQuery(`SELECT org_id FROM organisation_systems WHERE guid = ? and is_active = ? LIMIT 1`, [machineId, 1])
        if (org_id.length == 0) { return response.status(400).send({ error: false, message: 'Invalid machine id' }) }
        org_id = org_id[0].org_id

        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return response.status(400).send({ error: false, message: 'Organization Deactivated' }) }

        // Select devices list from devices table
        let device_list = await sqlQuery(`SELECT * FROM devices WHERE org_id = ?`, [org_id])
        return response.send(device_list)
    } catch (error) {
        console.log(error)
        return response.status(500).json({ message: 'Internal server error' });
    }
})

machineRouter.get('/:machineId/device/:DevicePath/delete_device', async (request, response) => {
    try {
        let machineId = request.params.machineId
        let DevicePath = request.params.DevicePath
        // Select orgainization id from organization table
        let org_id = await sqlQuery(`SELECT org_id FROM organisation_systems WHERE guid = ? and is_active = ? LIMIT 1`, [machineId, 1])
        if (org_id.length == 0) { return response.status(400).send({ error: false, message: 'Invalid machine id' }) }
        org_id = org_id[0].org_id

        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return response.status(400).send({ error: false, message: 'Organization Deactivated' }) }

        // device device from devices table
        let device_list = await sqlQuery(`DELETE FROM devices WHERE org_id = ? and device_path = ?`, [org_id, DevicePath])
        return response.send(device_list)
    } catch (error) {
        // console.log(error)
        return response.status(500).json({ message: 'Internal server error' });
    }
})

machineRouter.post('/:machineId/map_device_gate', async (request, response) => {
    try {
        let machineId = request.params.machineId
        let userData = request.body
        // Select orgainization id from organization table
        let org_id = await sqlQuery(`SELECT org_id FROM organisation_systems WHERE guid = ? and is_active = ? LIMIT 1`, [machineId, 1])
        if (org_id.length == 0) { return response.status(400).send({ error: false, message: 'Invalid machine id' }) }
        org_id = org_id[0].org_id

        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return response.status(400).send({ error: false, message: 'Organization Deactivated' }) }

        // Check if gate id is valid
        let gate_id = await sqlQuery(`SELECT gate_id FROM gates WHERE org_id = ? and gate_id = ? and is_active = ? LIMIT 1`, [org_id, userData.gateId, 1])
        if (gate_id.length == 0) { return response.status(400).send({ error: false, message: 'Invalid gate id' }) }
        gate_id = gate_id[0].gate_id

        // Check if device id is valid
        let device_id = await sqlQuery(`SELECT * FROM devices WHERE DevicePath = ? and org_id = ?`, [userData.path, org_id])
        if (device_id.length == 0) {
            // Insert device in device table
            let insert_device = await sqlQuery(`INSERT INTO devices (DevicePath, org_id, gate_id) VALUES (?,?,?)`, [userData.path, org_id, gate_id])
            return response.send('Device mapped')
        } else {
            // Update device in device table
            let update_device = await sqlQuery(`UPDATE devices SET gate_id = ? WHERE DevicePath = ? and org_id = ?`, [gate_id, userData.path, org_id])
            return response.send('Device mapped')
        }
    } catch (error) {
        // console.log(err)
        return response.status(500).json({ message: 'Internal server error' });
    }
})


machineRouter.post('/:machineId/map_device_type', async (request, response) => {
    try {
        let machineId = request.params.machineId
        let userData = request.body
        // Select orgainization id from organization table
        let org_id = await sqlQuery(`SELECT org_id FROM organisation_systems WHERE guid = ? and is_active = ? LIMIT 1`, [machineId, 1])
        if (org_id.length == 0) { return response.status(400).send({ error: false, message: 'Invalid machine id' }) }
        org_id = org_id[0].org_id

        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return response.status(400).send({ error: false, message: 'Organization Deactivated' }) }


        // Check if device id is valid
        let device_id = await sqlQuery(`SELECT * FROM devices WHERE DevicePath = ? and org_id = ?`, [userData.path, org_id])
        if (device_id.length == 0) {
            // Insert device in device table
            let insert_device = await sqlQuery(`INSERT INTO devices (DevicePath, org_id, device_type) VALUES (?,?,?)`, [userData.path, org_id, userData.value])
            return response.send('Device mapped')
        } else {
            // Update device in device table
            let update_device = await sqlQuery(`UPDATE devices SET device_type = ? WHERE DevicePath = ? and org_id = ?`, [userData.value, userData.path, org_id])
            return response.send('Device mapped')
        }
    } catch (error) {
        // console.log(err)
        return response.status(500).json({ message: 'Internal server error' });
    }
})

machineRouter.post('/:machineId/checkRFID', async (request, response) => {
    try {
        let machineId = request.params.machineId
        let rfidNo = request.body.rfidNo;
        let device = request.body.device;
        let gate_id_posted = device.gate_id;

        // Select orgainization id from organization table
        let org_id = await sqlQuery(`SELECT org_id FROM organisation_systems WHERE guid = ? and is_active = ? LIMIT 1`, [machineId, 1])
        if (org_id.length == 0) { return response.status(400).send({ error: true, message: 'Invalid machine id' }) }
        org_id = org_id[0].org_id

        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return response.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        // Check if gate id is valid
        let gate_id = await sqlQuery(`SELECT gate_id FROM gates WHERE org_id = ? and gate_id = ? and is_active = ? LIMIT 1`, [org_id, gate_id_posted, 1])
        if (gate_id.length == 0) { return response.status(400).send({ error: true, message: 'Invalid gate id' }) }
        gate_id = gate_id[0].gate_id

        // Check if rfid is valid
        let rfid = await sqlQuery(`SELECT visitor_id FROM rfidcards WHERE RFID_no = ? and org_id = ? and is_active = ? LIMIT 1`, [rfidNo, org_id, 1])
        if (rfid.length == 0) { return response.status(400).send({ error: true, message: 'Invalid RFID' }) }
        visitor_id = rfid[0].visitor_id

        // Check if rfid is mapped to visitor
        let visitor = await sqlQuery(`SELECT * FROM visitors WHERE visitor_id = ? and org_id = ? and is_active = ? LIMIT 1`, [visitor_id, org_id, 1])
        if (visitor.length == 0) { return response.status(400).send({ error: true, message: 'RFID not mapped to visitor' }) }

        // record log
        let type = device.device_type == 'READ_IN' ? 'IN' : 'OUT'
        let log = await sqlQuery(`INSERT INTO readerlogs (
        RFID_no,gate_id,org_id,visitor_id,device_info,type
        ) VALUES (?,?,?,?,?,?)`, [
            rfidNo,
            gate_id,
            org_id,
            visitor_id,
            JSON.stringify(device),
            type
        ])
        return response.send({ error: false, message: 'RFID Valid' })

    } catch (error) {
        // console.log(err)
        return response.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = machineRouter