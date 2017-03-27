"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
class Fabricator {
    static template(args) {
        if (Fabricator._data[args.name] == undefined) {
            Fabricator._data[args.name] = {
                from: args.from,
                attr: args.attr
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
        let dtf = Fabricator._dataToFabricate(name);
        let { tableName: tableName, attr: templateAttr } = dtf;
        let finalAttr = Object.assign({}, templateAttr, customAttr);
        let columns = Object.keys(finalAttr);
        let promises = [];
        columns.forEach((col) => {
            let val = Promise.resolve(typeof finalAttr[col] === 'function' ? finalAttr[col](finalAttr) : finalAttr[col]);
            if (val.isFulfilled()) {
                val = val.value();
            }
            else {
                promises.push(val);
            }
            finalAttr[col] = val;
        });
        return Promise.all(promises).then(() => {
            columns.forEach((col) => {
                finalAttr[col] = Promise.resolve(finalAttr[col]).value();
            });
            return Fabricator._dataStoreAdaptor.createData(tableName, finalAttr);
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