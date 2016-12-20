"use strict";
const mysql = require('mysql');
const Promise = require('bluebird');
class MySQLAdaptor {
    constructor(args) {
        if (args.conn) {
            this.conn = args.conn;
        }
        else if (args.config) {
            this.conn = mysql.createConnection(args.config);
            this.conn.connect();
        }
        else {
            throw new Error('conn or config is required to create new MySQLAdaptor');
        }
    }
    createData(tableName, finalAttr) {
        let columns = Object.keys(finalAttr);
        let values = columns.map((col) => finalAttr[col]);
        return new Promise((resolve, reject) => {
            let sql = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${values.map(v => '?').join(',')})`;
            this.conn.query(sql, values, (err, res) => {
                if (res.affectedRows > 0 && res.insertId > 0) {
                    resolve(Object.assign({}, finalAttr, { id: res.insertId }));
                }
                else {
                    reject(res);
                }
            });
        });
    }
}
exports.MySQLAdaptor = MySQLAdaptor;
//# sourceMappingURL=mysql-adaptor.js.map