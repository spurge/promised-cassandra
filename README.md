Promised Cassandra
==================
[![Build Status](https://semaphoreci.com/api/v1/spurge/promised-cassandra/branches/master/shields_badge.svg)](https://semaphoreci.com/spurge/promised-cassandra)

Q promise wrapper for [Datastax Cassandra driver](https://github.com/datastax/nodejs-driver)

Depends on node v6

Install
-------

`npm install --save cassandra-driver promised-cassandra`

Featured Cassandra driver functions
-----------------------------------

Everything. It's proxying the Cassandra driver.

But everything is not tested though.

### Tested Cassandra driver functions

* execute
* eachRow

Basic usage
-----------

```javascript
// Initiate cassandra connection
const cassandra = require('promised-cassandra');
// If no connection options are passed, connection will default to localhost
// or use CASSANDRA_CONTACT_POINTS environment variable.
const database = cassandra({
    contactPoints: ['127.0.0.1']
});
// or if your options comes from a promise
const database = cassandra(some_promise_that_resolves_an_options_object);

// Execute some CQL
database.execute(
    'SELECT email FROM users WHERE id=?',
    [123]
)
.then(result => {
    // result.rows
    // result.first().email
});

// Run eachRow
database.eachRow('SELECT email FROM users', null, (row => {
    // row.email
})
.then(result => {
    // result.rows
});
```

Some extra functions
--------------------

```javascript
// Create a keyspace if it doesn't already exist and start using it
database.create_keyspace(
    'keyspace-name', // Keyspace name
    {class: 'SimpleStrategy', replication_factor: 1}, // Replication options
    false // Durable writes
)
.then(() => {
    // Keyspace created
});

// Create table if it doesn't already exist
database.create_table(
    'table-name',
    {
        id: 'uuid PRIMARY KEY',
        column: 'text'
    }
)
.then(() => {
    // Table created
);
```
