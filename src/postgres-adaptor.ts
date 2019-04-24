import * as pg from 'pg';
import { DataStoreAdaptor } from './data-store-adaptor';

export class PostgresAdaptor implements DataStoreAdaptor {
  public conn: pg.Client;
  constructor(args: any) {
    if (args.conn) {
      this.conn = args.conn;
    } else if (args.config) {
      this.conn = new pg.Client(args.config);
      this.conn.connect();
    } else {
      throw new Error('conn or config is required to create new PostgresAdaptor');
    }
  }

  createData(tableName: string, finalAttr: Object): Promise<any> {
    let columns = Object.keys(finalAttr);
    let values = columns.map((col) => finalAttr[col]);
    return new Promise<any>((resolve, reject): any => {
      let columnsQuery = columns.map(c => `"${c}"`).join(',');
      let valuesQuery = values.map((v, ind) => `$${ind+1}`).join(',');
      let sql = `INSERT INTO "${tableName}" (${ columnsQuery }) VALUES (${ valuesQuery }) RETURNING id`;
      this.conn.query(sql, values, (err: Error, res: any) => {
        if (err) {
          throw(err);
        }
        const insertId = res.rows[0] && res.rows[0].id;
        if (res.rowCount > 0 && insertId > 0) {
          resolve(Object.assign({ id: insertId }, finalAttr));
        } else {
          reject(Object.assign({ id: null }, finalAttr));
        }
      });
    });
  }
}
