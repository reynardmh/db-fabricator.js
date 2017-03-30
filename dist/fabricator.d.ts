/// <reference types="bluebird" />
import * as Promise from 'bluebird';
import { DataStoreAdaptor } from './data-store-adaptor';
export interface FabricatorTemplateArg {
    name: string;
    from?: string;
    attr?: Object;
    afterCreate?: Function;
}
export interface DataToFabricate {
    tableName: string;
    attr: Object;
}
declare class Fabricator {
    static _data: Object;
    static _dataStoreAdaptor: DataStoreAdaptor;
    static template(args: FabricatorTemplateArg): void;
    static setAdaptor(adaptor: DataStoreAdaptor): void;
    static _dataToFabricate(name: string): DataToFabricate;
    static fabricate(name: string, customAttr?: Object): Promise<any>;
    /**
     * Helper function to fabricate and return the id of the fabricated object
     * So instead of:
     *   Fabricator.fabricate('organization').then(o => o.id)
     *
     * You can do:
     *   Fabricator.fabGetId('organization')
     */
    static fabGetId(name: string, customAttr?: Object): Promise<any>;
    /**
     * helper to get the id from a fabricated object promise
     */
    static getId(promise: any): Promise<any>;
    static clearTemplate(): void;
}
export { Fabricator, DataStoreAdaptor };
