import * as Promise from 'bluebird';
import { DataStoreAdaptor } from './data-store-adaptor';

export interface FabricatorTemplateArg {
  name: string,
  from?: string,
  attr?: Object,
  afterCreate?: Function
}

export interface DataToFabricate {
  tableName: string,
  attr: Object
}

class Fabricator {
  static _data: Object = {};
  static _dataStoreAdaptor: DataStoreAdaptor;
  static template(args: FabricatorTemplateArg): void {
    if (Fabricator._data[args.name] == undefined) {
      Fabricator._data[args.name] = {
        from: args.from,
        attr: args.attr,
        afterCreate: args.afterCreate
      };
    } else {
      throw Error(`Fabricator for ${args.name} has already been defined.`);
    }
  }

  static setAdaptor(adaptor: DataStoreAdaptor): void {
    Fabricator._dataStoreAdaptor = adaptor;
  }

  static _dataToFabricate(name: string): DataToFabricate {
    if (Fabricator._data[name] === undefined) {
      throw Error(`No Fabricator defined for ${Fabricator._data[name]}`)
    } else {
      if (Fabricator._data[name].from === undefined) {
        return {
          tableName: name,
          attr: Object.assign({}, Fabricator._data[name].attr)
        };
      } else {
        let templateData = Fabricator._dataToFabricate(Fabricator._data[name].from);
        return {
          tableName: templateData.tableName,
          attr: Object.assign({}, templateData.attr, Fabricator._data[name].attr)
        };
      }
    }
  }

  static fabricate(name: string, customAttr?: Object): Promise<any> {
    customAttr = customAttr || {};
    let { tableName: tableName, attr: templateAttr } = Fabricator._dataToFabricate(name);
    let finalAttr = Object.assign({}, templateAttr, customAttr);
    let columns = Object.keys(finalAttr);
    let promises: Promise<any>[] = [];
    columns.forEach((col) => {
      let val = Promise.resolve(typeof finalAttr[col] === 'function' ? finalAttr[col](finalAttr) : finalAttr[col]);
      if (val.isFulfilled()) {
        val = val.value();
      } else {
        promises.push(val);
      }
      finalAttr[col] = val;
    });
    return Promise.all(promises).then(() => {
      columns.forEach((col) => {
        finalAttr[col] = Promise.resolve(finalAttr[col]).value();
      });
      return Fabricator._dataStoreAdaptor.createData(tableName, finalAttr).then(obj => {
        let afterCreate = Fabricator._data[name].afterCreate;
        if (afterCreate) {
          return afterCreate(obj);
        } else {
          return obj;
        }
      });
    });
  }

  /**
   * Helper function to fabricate and return the id of the fabricated object
   * So instead of:
   *   Fabricator.fabricate('organization').then(o => o.id)
   *
   * You can do:
   *   Fabricator.fabGetId('organization')
   */
  static fabGetId(name: string, customAttr?: Object): Promise<any> {
    return Fabricator.fabricate(name, customAttr).then(obj => obj.id);
  }

  /**
   * helper to get the id from a fabricated object promise
   */
  static getId(promise: any): Promise<any> {
    return Promise.resolve(promise).then(o => o.id);
  }

  static clearTemplate(): void {
    Fabricator._data = {};
  }
}

export { Fabricator, DataStoreAdaptor };