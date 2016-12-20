import { Fabricator } from '../src/fabricator';
import { DataStoreAdaptor } from '../src/data-store-adaptor';
import * as Promise from 'bluebird';
import { expect } from 'chai';

class IdCounter {
  static counter: Object = {};
  static getId(name: string) {
    if (this.counter.hasOwnProperty(name)) {
      return ++this.counter[name];
    } else {
      return this.counter[name] = 1;
    }
  }
}

class MemoryDB {
  private data: Object = {};
  create(name: string, doc: any): Object {
    // console.log(doc);
    if (!this.data.hasOwnProperty(name)) {
      this.data[name] = {};
    }
    this.data[name][doc.id] = doc;
    return doc;
  }

  find(name: string, id: number): Object {
    return this.data[name][id];
  }
}
class MemoryDBAdaptor implements DataStoreAdaptor {

  constructor(public db?: MemoryDB) {}
  createData(tableName: string, finalAttr: Object): Promise<any> {
    let doc = Object.assign({}, finalAttr, { id: IdCounter.getId(tableName) });
    if (this.db) {
      this.db.create(tableName, doc)
    }
    return new Promise<any>((resolve, reject): any => {
      resolve(doc);
    });
  }
}

describe('fabricator', () => {
  let DB = new MemoryDB();
  before(() => {
    Fabricator.setAdaptor(new MemoryDBAdaptor(DB));
  });

  describe('with non async function attribute', () => {
    before(() => {
      Fabricator.template({
        name: 'user',
        attr: {
          firstName: 'Bob',
          lastName: 'Smith',
          username: (obj) => `${obj.firstName}.${obj.lastName}`
        }
      });
    });
    after(() => {
      Fabricator.clearTemplate();
    });
    
    it('creates object with composed attribute', (done) => {
      Fabricator.fabricate('user')
      .then((user) => {
        expect(user.firstName).to.equal('Bob');
        expect(user.username).to.equal('Bob.Smith');
        done();
      });
    });
    
    it('creates object with overriden attributes', (done) => {
      Fabricator.fabricate('user', { firstName: 'Jon' })
      .then((user) => {
        expect(user.firstName).to.equal('Jon');
        expect(user.username).to.equal('Jon.Smith');
        done();
      });
    });
    
    it('creates object with overidden function attribute', (done) => {
      Fabricator.fabricate('user', { firstName: 'Jon', username: 'jon123' })
      .then((user) => {
        expect(user.firstName).to.equal('Jon');
        expect(user.lastName).to.equal('Smith');
        expect(user.username).to.equal('jon123');
        done();
      });
    });
  });

  describe('with nested async function attributes', () => {
    before(() => {
      Fabricator.template({
        name: 'organization',
        attr: {
          name: 'Fabricator Inc'
        }
      });
      Fabricator.template({
        name: 'department',
        attr: {
          name: 'IT',
          organizationId: () => Fabricator.fabricate('organization')
        }
      });
      Fabricator.template({
        name: 'user',
        attr: {
          firstName: 'Bob',
          lastName: 'Smith',
          username: (obj) => `${obj.firstName}.${obj.lastName}`,
          departmentId: () => Fabricator.fabricate('department')
        }
      });
    });
    after(() => {
      Fabricator.clearTemplate();
    });

    it('creates object with composed attribute', (done) => {
      Fabricator.fabricate('user')
      .then((user) => {
        expect(user.username).to.equal('Bob.Smith');
        let dept = <any>DB.find('department', user.departmentId);
        let org  = <any>DB.find('organization', dept.organizationId);
        expect(dept.name).to.equal('IT');
        expect(org.name).to.equal('Fabricator Inc');
        done();
      });
    });

  });
});

