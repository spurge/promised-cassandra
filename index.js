const _ = require('lodash');
const cassandra = require('cassandra-driver');
const format = require('util').format;
const q = require('q');

/**
 * Minified Cassandra client wrapper class that handles the connection and
 * provides it within a promise.
 */
class Client {
	/**
	 * Constructs by setting connection options and initiates a connection
	 *
	 * @param {object} options Cassandra driver connection options
	 *
	 * @returns {void}
	 */
	constructor(options) {
		this.connect(options);
	}

	/**
	 * Gets the Cassandra driver connection options.
	 * 
	 * If not defined, it'll default to environment variable
	 * CASSANDRA_CONTACT_POINTS if defined, otherwise 127.0.0.1
	 *
	 * @returns {object} Cassandra driver connection options
	 */
	get options() {
		if (this._options) {
			return this._options;
		}

		return {
			contactPoints: (
				process.env.CASSANDRA_CONTACT_POINTS || '127.0.0.1'
			).split(',')
		};
	}

	/**
	 * Gets a connection promise
	 *
	 * If there's no promise already in memory, it'll create one,
	 * store it and return it.
	 *
	 * @returns {object} Cassandra client within a promise
	 */
	get connection() {
		if (this._connection) {
			return this._connection;
		}

		return this._connection = q.try(() => (
			new cassandra.Client(this.options)
		));
	}

	/**
	 * Initiates a cassandra driver instance by setting connection options
	 * and return connection promise.
	 *
	 * @param {object} options Cassandra driver connection options
	 *
	 * @returns {object} Cassandra connection within a promise
	 */
	connect(options) {
		this._options = options;

		return this.connection;
	}

	/**
	 * Creates a keyspace if it doesn't already exists and switches to it
	 *
	 * @param {string} name Keyspace name
	 * @param {object} replication Replication options
	 * @param {boolean} writes Durable writes option
	 *
	 * @returns {object} Promise
	 */
	create_keyspace(
		name,
		replication={class: 'SimpleStrategy', replication_factor: 1},
		writes=false
	) {
		return proxy(
			this.connection,
			'execute',
			format(
				'create keyspace if not exists %s\
				with replication = %s\
				and durable_writes = %s',
				name,
				JSON.stringify(replication).replace(/"/g, '\''),
				writes.toString()
			)
		)
		.then(() => proxy(
			this.connection,
			'execute',
			format('use %s', name)
		));
	}

	/**
	 * Creates a table if it doesn't already exists
	 *
	 * @param {string} name Table name
	 * @param {object} columns A set with {column_name: 'type'}
	 *
	 * @returns {object} Promise
	 */
	create_table(name, columns) {
		return proxy(
			this.connection,
			'execute',
			format(
				'create table if not exists %s (%s)',
				name,
				_.map(columns, (type, key) => {
					return format(key, type);
				}).join(', ')
			)
		);
	}
}

/**
 * A proxy getter that returns properties in client connection wrapper
 * object in first hand otherwise through the connection promise.
 *
 * @param {object} client Cassandra client connection wrapper
 * @param {string} property Property name
 *
 * @returns {object} Either some property in client wrapper otherwise
 * through connection promise
 */
function getter(client, property) {
	const value = client[property];

	if (value) {
		return value;
	}

	return _.wrap(property, _.wrap(client.connection, proxy));
}

/**
 * Takes the connection promise and invokes function at the resolved
 * objected with arguments
 *
 * @param {object} connection Connection promise
 * @param {string} func Function name
 * @param {...object} args Arguments passed to function
 *
 * @returns {object} Whatever the resolved function returns
 */
function proxy(connection, func, ...args) {
	return connection.then(client => {
		return q.npost(client, func, args);
	});
}

/**
 * Sets up the client connection wrapper with proxy
 *
 * @param {object} options Cassandra connection options
 *
 * @returns {object} Cassandra connection wrapper
 */
function setup(options) {
	return new Proxy(new Client(options), {
		get: getter
	});
}

module.exports = setup;
