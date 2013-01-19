# localStorageDB 1.9
### a simple, tiny database layer for localStorage, sessionStorage
Kailash Nadh

Documentation: http://kailashnadh.name/code/localstoragedb
Licensed under the MIT license.

v 1.9 November 2012

# Usage / Examples
### Creating a database, table, and populating the table

<pre>
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
</pre>


### Querying
<pre>
// simple select queries
lib.query("books", {year: 2011});
lib.query("books", {year: 1999, author: "Norretranders"});

// select all books
lib.query("books");

// select all books published after 2003
lib.query("books", function(row) {	// the callback function is applied to every row in the table
	if(row.year > 2003) {		// if it returns true, the row is selected
		return true;
	} else {
		return false;
	}
});

// select all books by Torday and Sparrow
lib.query("books", function(row) {
	if(row.author == "Torday" || row.author == "Sparrow") {
		return true;
	} else {
		return false;
	}
});
</pre>

### Example results from a query
<pre>
// query results are returned as arrays of object literals
// an ID field with the internal auto-incremented id of the row is also included
// thus, ID is a reserved field name

lib.query("books", {author: "ramachandran"});

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
</pre>


### Updating
<pre>
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
		row.year+=5;
		return row;
	}
);
</pre>

### Insert or Update conditionally
<pre>
// if there's a book with code B003, update it, or insert it as a new row
lib.insertOrUpdate("books", {code: 'B003'}, {	code: "B003",
						title: "Freakonomics",
						author: "Levitt and Dubner",
						year: 2005,
						copies: 15});
</pre>

### Deleting
<pre>
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
</pre>


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
			<td>Commits the database to localStorage</td>
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
			<td>createTable()</td>
			<td>table_name, fields</td>
			<td>Creates a table<br />
				- fields is an array of string fieldnames. 'ID' is a reserved fieldname.
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
			<td>query()</td>
			<td>table_name, query, limit</td>
			<td>
				Returns an array of rows (object literals) from a table matching the query.<br />
				- query is either an object literal or null. If query is not supplied, all rows are returned<br />
				- limit is the maximum number of rows to be returned<br />
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
