import * as pg from 'pg';
import { DataStoreAdaptor } from './data-store-adaptor';
export declare class PostgresAdaptor implements DataStoreAdaptor {
    conn: pg.Client;
    constructor(args: any);
    createData(tableName: string, finalAttr: Object): Promise<any>;
}
