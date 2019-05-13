"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Fabricator {
    static template(args) {
        if (Fabricator._data[args.name] == undefined) {
            Fabricator._data[args.name] = {
                from: args.from,
                attr: args.attr,
                afterCreate: args.afterCreate
            };
        }
        else {
            throw Error(`Fabricator for ${args.name} has already been defined.`);
        }
    }
    static setAdaptor(adaptor) {
        Fabricator._dataStoreAdaptor = adaptor;
    }
    static _dataToFabricate(name) {
        if (Fabricator._data[name] === undefined) {
            throw Error(`No Fabricator defined for ${Fabricator._data[name]}`);
        }
        else {
            if (Fabricator._data[name].from === undefined) {
                return {
                    tableName: name,
                    attr: Object.assign({}, Fabricator._data[name].attr)
                };
            }
            else {
                let templateData = Fabricator._dataToFabricate(Fabricator._data[name].from);
                return {
                    tableName: templateData.tableName,
                    attr: Object.assign({}, templateData.attr, Fabricator._data[name].attr)
                };
            }
        }
    }
    static fabricate(name, customAttr) {
        customAttr = customAttr || {};
        let { tableName: tableName, attr: templateAttr } = Fabricator._dataToFabricate(name);
        let finalAttr = Object.assign({}, templateAttr, customAttr);
        let columns = Object.keys(finalAttr);
        let promiseMap = new Map();
        columns.forEach((col) => {
            let val = Promise.resolve(typeof finalAttr[col] === 'function' ? finalAttr[col](finalAttr) : finalAttr[col]);
            promiseMap.set(col, val);
        });
        return Promise.all(promiseMap.values()).then((finalValues) => {
            let counter = 0;
            promiseMap.forEach((val, key) => {
                finalAttr[key] = finalValues[counter];
                ++counter;
            });
            return Fabricator._dataStoreAdaptor.createData(tableName, finalAttr).then(obj => {
                let afterCreate = Fabricator._data[name].afterCreate;
                if (afterCreate) {
                    return afterCreate(obj);
                }
                else {
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
    static fabGetId(name, customAttr) {
        return Fabricator.fabricate(name, customAttr).then(obj => obj.id);
    }
    /**
     * helper to get the id from a fabricated object promise
     */
    static getId(promise) {
        return Promise.resolve(promise).then(o => o.id);
    }
    static clearTemplate() {
        Fabricator._data = {};
    }
}
Fabricator._data = {};
exports.Fabricator = Fabricator;
//# sourceMappingURL=fabricator.js.map