import * as mysql from 'mysql';
import { DataStoreAdaptor } from './data-store-adaptor';

export class MySQLAdaptor implements DataStoreAdaptor {
  public conn: mysql.IConnection;
  constructor(args: any) {
    if (args.conn) {
      this.conn = args.conn;
    } else if (args.config) {
      this.conn = mysql.createConnection(args.config);
      this.conn.connect();
    } else {
      throw new Error('conn or config is required to create new MySQLAdaptor');
    }
  }

  createData(tableName: string, finalAttr: Object): Promise<any> {
    let columns = Object.keys(finalAttr);
    let values = columns.map((col) => finalAttr[col]);
    return new Promise<any>((resolve, reject): any => {
      let sql = `INSERT INTO ${tableName} (${ columns.join(',') }) VALUES (${ values.map(v => '?').join(',') })`;
      this.conn.query(sql, values, (err: Error, res: any) => {
        if (err) {
          throw(err);
        }
        if (res.affectedRows > 0 && res.insertId > 0) {
          resolve(Object.assign({ id: res.insertId }, finalAttr));
        } else {
          reject(Object.assign({ id: null }, finalAttr));
        }
      });
    });
  }
}
