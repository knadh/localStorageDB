/*
	Kailash Nadh (http://kailashnadh.name)
	
	localStorageDB
	September 2011
	A simple database layer for localStorage

	v 1.9 November 2012

	License	:	MIT License
*/

function localStorageDB(db_name, engine) {

	var db_prefix = 'db_',
		db_id = db_prefix + db_name,
		db_new = false,	// this flag determines whether a new database was created during an object initialisation
		db = null,
		storage = (engine == sessionStorage ? sessionStorage: localStorage);

	// if the database doesn't exist, create it
	db = storage[ db_id ];
	if( !( db && (db = JSON.parse(db)) && db.tables && db.data ) ) {
		if(!validateName(db_name)) {
			error("The name '" + db_name + "'" + " contains invalid characters.");
		} else {
			db = {tables: {}, data: {}};
			commit();
			db_new = true;
		}
	}
	
	
	// ______________________ private methods
	
	// _________ database functions
	// drop the database
	function drop() {
		delete storage[db_id];
		db = null;
	}
			
	// number of tables in the database
	function tableCount() {
		var count = 0;
		for(var table in db.tables) {
			if( db.tables.hasOwnProperty(table) ) {
				count++;
			}
		}
		return count;
	}

	// _________ table functions
	
	// check whether a table exists
	function tableExists(table_name) {
		return db.tables[table_name] ? true : false;
	}
	
	// check whether a table exists, and if not, throw an error
	function tableExistsWarn(table_name) {
		if(!tableExists(table_name)) {
			error("The table '" + table_name + "' does not exist.");
		}
	}
		
	// create a table
	function createTable(table_name, fields) {
		db.tables[table_name] = {fields: fields, auto_increment: 1};
		db.data[table_name] = {};
	}
	
	// drop a table
	function dropTable(table_name) {
		delete db.tables[table_name];
		delete db.data[table_name];
	}
	
	// empty a table
	function truncate(table_name) {
		db.tables[table_name].auto_increment = 1;
		db.data[table_name] = {};
	}
	
	// number of rows in a table
	function rowCount(table_name) {
		var count = 0;
		for(var ID in db.data[table_name]) {
			if( db.data[table_name].hasOwnProperty(ID) ) {
				count++;
			}
		}
		return count;
	}
	
	// insert a new row
	function insert(table_name, data) {
		data.ID = db.tables[table_name].auto_increment;
		db.data[table_name][ db.tables[table_name].auto_increment ] = data;
		db.tables[table_name].auto_increment++;
		return data.ID;
	}
	
	// select rows, given a list of IDs of rows in a table
	function select(table_name, ids) {
		var ID = null, results = [], row = null;
		for(var i=0; i<ids.length; i++) {
			ID = ids[i];
			row = db.data[table_name][ID];
			results.push( clone(row) );
		}
		return results;
	}
	
	// select rows in a table by field-value pairs, returns the IDs of matches
	function queryByValues(table_name, data, limit) {
		var result_ids = [],
			exists = false,
			row = null;

		// loop through all the records in the table, looking for matches
		for(var ID in db.data[table_name]) {
			if( !db.data[table_name].hasOwnProperty(ID) ) {
				continue;
			}

			row = db.data[table_name][ID];
			exists = true;

			for(var field in data) {
				if( !data.hasOwnProperty(field) ) {
					continue;
				}

				if(typeof data[field] == 'string') {	// if the field is a string, do a case insensitive comparison
					if( row[field].toString().toLowerCase() != data[field].toString().toLowerCase() ) {
						exists = false;
						break;
					}
				} else {
					if( row[field] != data[field] ) {
						exists = false;
						break;
					}
				}
			}
			if(exists) {
				result_ids.push(ID);
			}
			if(result_ids.length == limit) {
				break;
			}
		}
		return result_ids;
	}
	
	// select rows in a table by a function, returns the IDs of matches
	function queryByFunction(table_name, query_function, limit) {
		var result_ids = [],
			exists = false,
			row = null;

		// loop through all the records in the table, looking for matches
		for(var ID in db.data[table_name]) {
			if( !db.data[table_name].hasOwnProperty(ID) ) {
				continue;
			}

			row = db.data[table_name][ID];

			if( query_function( clone(row) ) == true ) {	// it's a match if the supplied conditional function is satisfied
				result_ids.push(ID);
			}
			if(result_ids.length == limit) {
				break;
			}
		}
		return result_ids;
	}
	
	// return all the IDs in a table
	function getIDs(table_name, limit) {
		var result_ids = [];
		for(var ID in db.data[table_name]) {
			if( db.data[table_name].hasOwnProperty(ID) ) {
				result_ids.push(ID);

				if(result_ids.length == limit) {
					break;
				}
			}
		}
		return result_ids;
	}
	
	// delete rows, given a list of their IDs in a table
	function deleteRows(table_name, ids) {
		for(var i=0; i<ids.length; i++) {
			if( db.data[table_name].hasOwnProperty(ids[i]) ) {
				delete db.data[table_name][ ids[i] ];
			}
		}
		return ids.length;
	}
	
	// update rows
	function update(table_name, ids, update_function) {
		var ID = '', num = 0;

		for(var i=0; i<ids.length; i++) {
			ID = ids[i];

			var updated_data = update_function( clone(db.data[table_name][ID]) );

			if(updated_data) {
				delete updated_data['ID']; // no updates possible to ID

				var new_data = db.data[table_name][ID];				
				// merge updated data with existing data
				for(var field in updated_data) {
					if( updated_data.hasOwnProperty(field) ) {
						new_data[field] = updated_data[field];
					}
				}

				db.data[table_name][ID] = validFields(table_name, new_data);
				num++;
			}
		}
		return num;
	}
	


	// commit the database to localStorage
	function commit() {
		storage[db_id] = JSON.stringify(db);
	}
	
	// serialize the database
	function serialize() {
		return JSON.stringify(db);
	}
	
	// throw an error
	function error(msg) {
		throw new Error(msg);
	}
	
	// clone an object
	function clone(obj) {
		var new_obj = {};
		for(var key in obj) {
			if( obj.hasOwnProperty(key) ) {
				new_obj[key] = obj[key];
			}
		}
		return new_obj;
	}
	
	// validate db, table, field names (alpha-numeric only)
	function validateName(name) {
		return name.match(/[^a-z_0-9]/ig) ? false : true;
	}
	
	// given a data list, only retain valid fields in a table
	function validFields(table_name, data) {
		var field = '', new_data = {};

		for(var i=0; i<db.tables[table_name].fields.length; i++) {
			field = db.tables[table_name].fields[i];
			
			if(data[field]) {
				new_data[field] = data[field];
			}
		}
		return new_data;
	}
	
	// given a data list, populate with valid field names of a table
	function validateData(table_name, data) {
		var field = '', new_data = {};
		for(var i=0; i<db.tables[table_name].fields.length; i++) {
			field = db.tables[table_name].fields[i];
			new_data[field] = data[field] ? data[field] : null;
		}
		return new_data;
	}
	


	// ______________________ public methods

	return {
		// commit the database to localStorage
		commit: function() {
			commit();
		},
		
		// is this instance a newly created database?
		isNew: function() {
			return db_new;
		},
		
		// delete the database
		drop: function() {
			drop();
		},
		
		// serialize the database
		serialize: function() {
			return serialize();
		},
		
		// check whether a table exists
		tableExists: function(table_name) {
			return tableExists(table_name);
		},
		
		// number of tables in the database
		tableCount: function() {
			return tableCount();
		},
		
		// create a table
		createTable: function(table_name, fields) {
			var result = false;
			if(!validateName(table_name)) {
				error("The database name '" + table_name + "'" + " contains invalid characters.");
			} else if(this.tableExists(table_name)) {
				error("The table name '" + table_name + "' already exists.");
			} else {
				// make sure field names are valid
				var is_valid = true;
				for(var i=0; i<fields.length; i++) {
					if(!validateName(fields[i])) {
						is_valid = false;
						break;
					}
				}
				
				if(is_valid) {
					// cannot use indexOf due to <IE9 incompatibility
					// de-duplicate the field list
					var fields_literal = {};
					for(var i=0; i<fields.length; i++) {
						fields_literal[ fields[i] ] = true;
					}
					delete fields_literal['ID']; // ID is a reserved field name

					fields = ['ID'];
					for(var field in fields_literal) {
						if( fields_literal.hasOwnProperty(field) ) {
							fields.push(field);
						}
					}

					createTable(table_name, fields);
					result = true;
				} else {
					error("One or more field names in the table definition contains invalid characters.");
				}
			}

			return result;
		},
		
		// drop a table
		dropTable: function(table_name) {
			tableExistsWarn(table_name);
			dropTable(table_name);
		},
		
		// empty a table
		truncate: function(table_name) {
			tableExistsWarn(table_name);
			truncate(table_name);
		},
		
		// number of rows in a table
		rowCount: function(table_name) {
			tableExistsWarn(table_name);
			return rowCount(table_name);
		},
		
		// insert a row
		insert: function(table_name, data) {
			tableExistsWarn(table_name);
			return insert(table_name, validateData(table_name, data) );
		},

		// insert or update based on a given condition
		insertOrUpdate: function(table_name, query, data) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);				// there is no query. applies to all records
			} else if(typeof query == 'object') {				// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {				// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query);
			}

			// no existing records matched, so insert a new row
			if(result_ids.length == 0) {
				return insert(table_name, validateData(table_name, data) );
			} else {
				var ids = [];
				for(var n=0; n<result_ids.length; n++) {
					update(table_name, result_ids, function(o) {
						ids.push(o.ID);
						return data;
					});
				}

				return ids;
			}
		},
		
		// update rows
		update: function(table_name, query, update_function) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);				// there is no query. applies to all records
			} else if(typeof query == 'object') {				// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {				// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query);
			}
			return update(table_name, result_ids, update_function);
		},

		// select rows
		query: function(table_name, query, limit) {
			tableExistsWarn(table_name);
			
			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name, limit); // no conditions given, return all records
			} else if(typeof query == 'object') {			// the query has key-value pairs provided
				result_ids = queryByValues(table_name, validFields(table_name, query), limit);
			} else if(typeof query == 'function') {		// the query has a conditional map function provided
				result_ids = queryByFunction(table_name, query, limit);
			}
			return select(table_name, result_ids, limit);
		},

		// delete rows
		deleteRows: function(table_name, query) {
			tableExistsWarn(table_name);

			var result_ids = [];
			if(!query) {
				result_ids = getIDs(table_name);
			} else if(typeof query == 'object') {
				result_ids = queryByValues(table_name, validFields(table_name, query));
			} else if(typeof query == 'function') {
				result_ids = queryByFunction(table_name, query);
			}
			return deleteRows(table_name, result_ids);
		}
	}
}