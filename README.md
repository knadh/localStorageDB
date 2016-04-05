# localStorageDB 2.3.1
localStorageDB is a simple layer over localStorage (and sessionStorage) that provides 
a set of functions to store structured data like databases and tables.
It provides basic insert/update/delete/query capabilities.
localStorageDB has no dependencies, and is not based on WebSQL. Underneath it all, 
the structured data is stored as serialized JSON in localStorage or sessionStorage.

- Kailash Nadh
- v 2.3.1 Mar 2015
- v 2.3.0 Feb 2014 Contribution: Christian Kellner (http://orange-coding.net)
- v 2.2 Jan 2014 Contribution: Andy Hawkins (http://a904guy.com)
- v 2.1 Nov 2013
- v 2.0 Jun 2013
- v 1.9 Nov 2012
- Documentation: [http://nadh.in/code/localstoragedb](http://nadh.in/code/localstoragedb)
- Licensed: MIT license

# Installation
`bower install localstoragedb`

# Run Test Cases

```shell
bower install # install mocha and chai for running test cases
```
`open test/local_storage_db_test.html in Browser to check the result`

# Supported Browsers
Browsers need to support "Local Storage" in order to make localeStorageDB working.

- IE 8<
- Firefox 31<
- Chrome 31<
- Safari 7<
- iOS Safari 7.1<
- Android Browser 4.1<
- Chrome for Android 42<

# Usage / Examples
### Creating a database, table, and populating the table

```javascript
// Initialise. If the database doesn't exist, it is created
var lib = new localStorageDB("library", localStorage);

// Check if the database was just created. Useful for initial database setup
if( lib.isNew() ) {

    // create the "books" table
	lib.createTable("books", ["code", "title", "author", "year", "copies"]);
	
	// insert some data
	lib.insert("books", {code: "B001", title: "Phantoms in the brain", author: "Ramachandran", year: 1999, copies: 10});
	lib.insert("books", {code: "B002", title: "The tell-tale brain", author: "Ramachandran", year: 2011, copies: 10});
	lib.insert("books", {code: "B003", title: "Freakonomics", author: "Levitt and Dubner", year: 2005, copies: 10});
	lib.insert("books", {code: "B004", title: "Predictably irrational", author: "Ariely", year: 2008, copies: 10});
	lib.insert("books", {code: "B005", title: "Tesla: Man out of time", author: "Cheney", year: 2001, copies: 10});
	lib.insert("books", {code: "B006", title: "Salmon fishing in the Yemen", author: "Torday", year: 2007, copies: 10});
	lib.insert("books", {code: "B007", title: "The user illusion", author: "Norretranders", year: 1999, copies: 10});
	lib.insert("books", {code: "B008", title: "Hubble: Window of the universe", author: "Sparrow", year: 2010, copies: 10});
	
	// commit the database to localStorage
	// all create/drop/insert/update/delete operations should be committed
	lib.commit();
}
```

### Creating and populating a table in one go
```
	// rows for pre-population
	var rows = [
		{code: "B001", title: "Phantoms in the brain", author: "Ramachandran", year: 1999, copies: 10},
		{code: "B002", title: "The tell-tale brain", author: "Ramachandran", year: 2011, copies: 10},
		{code: "B003", title: "Freakonomics", author: "Levitt and Dubner", year: 2005, copies: 10},
		{code: "B004", title: "Predictably irrational", author: "Ariely", year: 2008, copies: 10},
		{code: "B005", title: "Tesla: Man out of time", author: "Cheney", year: 2001, copies: 10},
		{code: "B006", title: "Salmon fishing in the Yemen", author: "Torday", year: 2007, copies: 10},
		{code: "B007", title: "The user illusion", author: "Norretranders", year: 1999, copies: 10},
		{code: "B008", title: "Hubble: Window of the universe", author: "Sparrow", year: 2010, copies: 10}
	];

	// create the table and insert records in one go
	lib.createTableWithData("books", rows);

	lib.commit();
```
### Altering
```javascript
// If database already exists, and want to alter existing tables
if(! (lib.columnExists("books", "publication")) ) {
	lib.alterTable("books", "publication", "McGraw-Hill Education");
	lib.commit(); // commit the deletions to localStorage
}

// Multiple columns can also added at once
if(! (lib.columnExists("books", "publication") && lib.columnExists("books", "ISBN")) ) {
	lib.alterTable("books", ["publication", "ISBN"], {publication: "McGraw-Hill Education", ISBN: "85-359-0277-5"});
	lib.commit(); // commit the deletions to localStorage
}
```

### Querying
`query()` is deprecated. Use `queryAll()` instead.

```javascript
// simple select queries
lib.queryAll("books", {
	query: {year: 2011}
});
lib.queryAll("books", {
	query: {year: 1999, author: "Norretranders"}
});

// select all books
lib.queryAll("books");

// select all books published after 2003
lib.queryAll("books", {
	query: function(row) {    // the callback function is applied to every row in the table
		if(row.year > 2003) {		// if it returns true, the row is selected
			return true;
		} else {
			return false;
		}
	}
});

// select all books by Torday and Sparrow
lib.queryAll("books", {
    query: function(row) {
            if(row.author == "Torday" || row.author == "Sparrow") {
		        return true;
	        } else {
		        return false;
	    }
    },
    limit: 5
});
```

### Sorting
```javascript
// select 5 rows sorted in ascending order by author
lib.queryAll("books", { limit: 5,
                        sort: [["author", "ASC"]]
                      });

// select all rows first sorted in ascending order by author, and then, in descending, by year
lib.queryAll("books", { sort: [["author", "ASC"], ["year", "DESC"]] });

lib.queryAll("books", { query: {"year": 2011},
                        limit: 5,
                        sort: [["author", "ASC"]]
                      });

// or using query()'s positional arguments, which is a little messy (DEPRECATED)
lib.query("books", null, null, null, [["author", "ASC"]]);
```

### Distinct records
```javascript
lib.queryAll("books", { distinct: ["year", "author"]
                      });

```

### Example results from a query
```javascript
// query results are returned as arrays of object literals
// an ID field with the internal auto-incremented id of the row is also included
// thus, ID is a reserved field name

lib.queryAll("books", {query: {author: "ramachandran"}});

/* results
[
 {
   ID: 1,
   code: "B001",
   title: "Phantoms in the brain",
   author: "Ramachandran",
   year: 1999,
   copies: 10
 },
 {
   ID: 2,
   code: "B002",
   title: "The tell-tale brain",
   author: "Ramachandran",
   year: 2011,
   copies: 10
 }
]
*/
```


### Updating
```javascript
// change the title of books published in 1999 to "Unknown"
lib.update("books", {year: 1999}, function(row) {
	row.title = "Unknown";
	
	// the update callback function returns to the modified record
	return row;
});

// add +5 copies to all books published after 2003
lib.update("books",
	function(row) {	// select condition callback
		if(row.year > 2003) {
			return true;
		} else {
			return false;
		}
	},
	function(row) { // update function
		row.copies+=5;
		return row;
	}
);
```

### Insert or Update conditionally
```javascript
// if there's a book with code B003, update it, or insert it as a new row
lib.insertOrUpdate("books", {code: 'B003'}, {	code: "B003",
						title: "Freakonomics",
						author: "Levitt and Dubner",
						year: 2005,
						copies: 15});

lib.commit();
```

### Deleting
```javascript
// delete all books published in 1999
lib.deleteRows("books", {year: 1999});

// delete all books published before 2005
lib.deleteRows("books", function(row) {
	if(row.year < 2005) {
		return true;
	} else {
		return false;
	}
});

lib.commit(); // commit the deletions to localStorage
```


# Methods
<table>
	<thead>
		<tr>
			<th>Method</th/>
			<th>Arguments</th/>
			<th>Description</th>
		</tr>
	</thead>
	<tbody>
		<tr>
			<td>localStorageDB()</td>
			<td>database_name, storage_engine</td>
			<td>Constructor<br />
				- storage_engine can either be localStorage (default) or sessionStorage
			</td>
		</tr>
		<tr>
			<td>isNew()</td>
			<td></td>
			<td>Returns true if a database was created at the time of initialisation with the constructor</td>
		</tr>
		<tr>
			<td>drop()</td>
			<td></td>
			<td>Deletes a database, and purges it from localStorage</td>
		</tr>
		<tr>
			<td>tableCount()</td>
			<td></td>
			<td>Returns the number of tables in a database</td>
		</tr>
		<tr>
			<td>commit()</td>
			<td></td>
			<td>Commits the database to localStorage. Returns true if successful, and false otherwise (highly unlikely)</td>
		</tr>
		<tr>
			<td>serialize()</td>
			<td></td>
			<td>Returns the entire database as serialized JSON</td>
		</tr>


		<tr>
			<td>tableExists()</td>
			<td>table_name</td>
			<td>Checks whether a table exists in the database</td>
		</tr>
		<tr>
			<td>tableFields()</td>
			<td>table_name</td>
			<td>Returns the list of fields of a table</td>
		</tr>
		<tr>
			<td>createTable()</td>
			<td>table_name, fields</td>
			<td>Creates a table<br />
				- fields is an array of string fieldnames. 'ID' is a reserved fieldname.
			</td>
		</tr>
		<tr>
			<td>createTableWithData()</td>
			<td>table_name, rows</td>
			<td>Creates a table and populates it<br />
				- rows is an array of object literals where each object represents a record<br />
				[{field1: val, field2: val}, {field1: val, field2: val}]
			</td>
		</tr>
		<tr>
			<td>alterTable()</td>
			<td>table_name, new_fields, default_values</td>
			<td>Alter a table<br />
				- new_fields can be a array of columns OR a string of single column.<br />
				- default_values (optional) can be a object of column's default values OR a default value string for single column for existing rows.
			</td>
		</tr>
		<tr>
			<td>dropTable()</td>
			<td>table_name</td>
			<td>Deletes a table from the database</td>
		</tr>
		<tr>
			<td>truncate()</td>
			<td>table_name</td>
			<td>Empties all records in a table and resets the internal auto increment ID to 0</td>
		</tr>
		<tr>
			<td>columnExists()</td>
			<td>table_name, field_name</td>
			<td>Checks whether a column exists in database table.</td>
		</tr>
		<tr>
			<td>rowCount()</td>
			<td>table_name</td>
			<td>Returns the number of rows in a table</td>
		</tr>

		
		<tr>
			<td>insert()</td>
			<td>table_name, data</td>
			<td>Inserts a row into a table and returns its numerical ID<br />
				- data is an object literal with field-values<br />
				Every row is assigned an auto-incremented numerical ID automatically
			</td>
		</tr>
    	<tr>
			<td>query() DEPRECATED</td>
			<td>table_name, query, limit, start, sort</td>
			<td></td>
		</tr>
        <tr>
			<td>queryAll()</td>
			<td>table_name, params{}</td>
			<td>
				Returns an array of rows (object literals) from a table matching the query.<br />
				- query is either an object literal or null. If query is not supplied, all rows are returned<br />
				- limit is the maximum number of rows to be returned<br />
    			- start is the  number of rows to be skipped from the beginning (offset)<br />
    			- sort is an array of sort conditions, each one of which is an array in itself with two values<br />
    			- distinct is an array of fields whose values have to be unique in the returned rows<br />
				Every returned row will have it's internal auto-incremented id assigned to the variable ID</td>
		</tr>
		<tr>
			<td>update()</td>
			<td>table_name, query, update_function</td>
			<td>Updates existing records in a table matching query, and returns the number of rows affected<br />
				- query is an object literal or a function. If query is not supplied, all rows are updated<br />
				- update_function is a function that returns an object literal with the updated values
			</td>
		</tr>
			<tr>
				<td>insertOrUpdate()</td>
				<td>table_name, query, data</td>
				<td>Inserts a row into a table if the given query matches no results, or updates the rows matching the query.<br />
					- query is either an object literal, function, or null.<br />
					- data is an object literal with field-values
					<br /><br />
					Returns the numerical ID if a new row was inserted, or an array of IDs if rows were updated
				</td>
			</tr>
		<tr>
			<td>deleteRows()</td>
			<td>table_name, query</td>
			<td>Deletes rows from a table matching query, and returns the number of rows deleted<br />
				- query is either an object literal or a function. If query is not supplied, all rows are deleted
			</td>
		</tr>
	</tbody>
</table>

# Storing complex objects
While the library is meant for storing fundamental types (strings, numbers, bools), it is possible to store object literals and arrays as column values, with certain caveats. Some comparison queries, distinct etc. may not work. In addition, if you retrieve a stored array in a query result and modify its values in place, these changes will persist throughout further queries until the page is refreshed. This is because localStorageDB loads and unserializes data and keeps it in memory in a global pool until the page is refreshed, and arrays and objects returned in results are passed by reference.

If you really need to store arrays and objects, you should implement a deep-copy function through which you pass the results before manipulation.
