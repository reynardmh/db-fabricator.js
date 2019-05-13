export interface DataStoreAdaptor {
  createData(tableName: string, finalAttr: Object): Promise<any>;
}
