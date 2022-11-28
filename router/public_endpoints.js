const publicRouter = require('express').Router();

publicRouter.get('/visitor_logs/:org_id', async (request, response) => {
    try {
        let org_id = request.params.org_id
        let date = request.query.date

        // Check if organization is active
        let org_status = await sqlQuery(`SELECT name FROM organisations WHERE org_id = ? and is_active = ?  LIMIT 1`, [org_id, 1])
        if (org_status.length == 0) { return response.status(400).send({ error: true, message: 'Organization Deactivated' }) }

        // Check if date is valid
        if (date == undefined || date == null || date == '') {
            date = new Date()
            date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        } else {
            date = new Date(date)
            date = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        }

        // Get logs group by date and visitor
        let logs = await sqlQuery(`SELECT * FROM readerlogs as log 
    JOIN visitors ON (log.visitor_id = visitors.visitor_id) 
    JOIN gates ON (log.gate_id = gates.gate_id) 
    WHERE log.org_id = ? and DATE(created_at) = ?`, [org_id, date])

        masterLogs = []
        logs.forEach(log => {
            let index = masterLogs.findIndex(x => x.visitor_id == log.visitor_id)
            if (index == -1) {
                masterLogs.push({
                    visitor_id: log.visitor_id,
                    name: log.name,
                    designation: log.designation,
                    RFIDNO: log.RFID_no,
                    TIME_IN: log.type == 'IN' ? log.created_at : '',
                    TIME_OUT: log.type == 'OUT' ? log.created_at : '',
                    GATE: log.gate_name,
                    ENTRY_COUNT: log.type == 'IN' ? 1 : 0,
                    EXIT_COUNT: log.type == 'OUT' ? 1 : 0
                })
            } else {
                if (log.type == 'IN') {
                    masterLogs[index].TIME_IN = (masterLogs[index].TIME_IN > log.created_at) ? log.created_at : masterLogs[index].TIME_IN
                    masterLogs[index].ENTRY_COUNT += 1
                } else {
                    masterLogs[index].TIME_OUT = (masterLogs[index].TIME_OUT < log.created_at) ? log.created_at : masterLogs[index].TIME_OUT
                    masterLogs[index].EXIT_COUNT += 1
                }
            }
        });


        // Create csv
        let csv = 'Visitor Id,Name,Designation,RFID No,Time In,Time Out,Gate, ENTRY_COUNT, EXIT COUNT\r\n'
        masterLogs.forEach(log => {
            csv += log.visitor_id + ',' + log.name + ',' + log.designation + ',' + log.RFIDNO + ',' + log.TIME_IN + ',' + log.TIME_OUT + ',' + log.GATE + ',' + log.ENTRY_COUNT + ',' + log.EXIT_COUNT + '\r\n'
        });

        response.setHeader('Content-disposition', 'attachment; filename=visitor_logs.csv');
        response.set('Content-Type', 'text/csv');
        response.status(200).send(csv);
    } catch (error) {
        return response.status(400).send(err)
    }
})

publicRouter.get('/visitor_logs', async (request, response) => {
    // Create HTML Form
    let html = `
    <html>
        <head>
            <title>Visitor Logs</title>
        </head>
        <body>
            <form action="/visitor_logs/1" method="get">
                <input type="date" name="date" />
                <input type="submit" value="Download" />
            </form>
        </body>
    </html>
    `
    response.send(html)
})

module.exports = publicRouter