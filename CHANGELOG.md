# Changelog

## Version 2.0.1 - 2017-03-12

Allow aliasing the fabricate method to make it less verbose. 

```
let fabricate = Fabricator.fabricate; 
fabricate('something', { foo: 'bar });
```

## Version 2.0 - 2017-03-12

Major (breaking) change:

* Template attribute can be a promise.
* Using fabricated object as attribute no longer assume to use the id
```
// Old syntax
{ something_id: () => Fabricator.fabricate('something') }

// New syntax
{ something_id: () => Fabricator.fabricate('something').then(o => o.id) }

// Or, use helper fabGetId which will fabricate something and then return the id
{ something_id: () => Fabricator.fabGetId('something') }
```

* Add a few helper methods to make using fabricated object as template attribute easier.

## Version 1.0.3 - 2017-03-01

Minor bug fix: Throw error when query to mysql returns error

## Version 1.0.2 - 2016-12-21

Documentation update

## Version 1.0.1 - 2016-12-20

Publish on npm