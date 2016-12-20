/// <reference types="chai" />
/// <reference types="bluebird" />
import * as Promise from 'bluebird';
export interface DataStoreAdaptor {
    createData(tableName: string, finalAttr: Object): Promise<any>;
}
