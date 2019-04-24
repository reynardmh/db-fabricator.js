import * as mysql from 'mysql';
import { DataStoreAdaptor } from './data-store-adaptor';
export declare class MySQLAdaptor implements DataStoreAdaptor {
    conn: mysql.IConnection;
    constructor(args: any);
    createData(tableName: string, finalAttr: Object): Promise<any>;
}
