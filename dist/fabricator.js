"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Promise = require("bluebird");
class Fabricator {
    static template(args) {
        if (this._data[args.name] == undefined) {
            this._data[args.name] = {
                from: args.from,
                attr: args.attr
            };
        }
        else {
            throw Error(`Fabricator for ${args.name} has already been defined.`);
        }
    }
    static setAdaptor(adaptor) {
        this._dataStoreAdaptor = adaptor;
    }
    static _dataToFabricate(name) {
        if (this._data[name] === undefined) {
            throw Error(`No Fabricator defined for ${this._data[name]}`);
        }
        else {
            if (this._data[name].from === undefined) {
                return {
                    tableName: name,
                    attr: Object.assign({}, this._data[name].attr)
                };
            }
            else {
                let templateData = this._dataToFabricate(this._data[name].from);
                return {
                    tableName: templateData.tableName,
                    attr: Object.assign({}, templateData.attr, this._data[name].attr)
                };
            }
        }
    }
    static fabricate(name, customAttr) {
        customAttr = customAttr || {};
        let dtf = this._dataToFabricate(name);
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
            return this._dataStoreAdaptor.createData(tableName, finalAttr);
        });
    }
    static clearTemplate() {
        this._data = {};
    }
}
Fabricator._data = {};
exports.Fabricator = Fabricator;
//# sourceMappingURL=fabricator.js.map