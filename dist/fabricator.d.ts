import { DataStoreAdaptor } from './data-store-adaptor';
export interface FabricatorTemplateArg {
    name: string;
    from?: string;
    attr: Object;
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
    static fabricate(name: string, customAttr?: Object): any;
    static clearTemplate(): void;
}
export { Fabricator, DataStoreAdaptor };
