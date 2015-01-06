var expect = chai.expect;

describe("localStorageDB", function() {

  describe("db opration", function() {
    it("should create a test db", function() {
    	// first create
    	var test_db = new localStorageDB("test_db", localStorage);
    	// then drop 
    	test_db.drop();
    	test_db.commit();
    	// then create, test db should be new
    	test_db = new localStorageDB("test_db", localStorage);
    	expect(test_db.isNew()).to.equal(true);
    });
  });

  describe("CRUD opration", function() {
  	var db = getTestDB();
	var cur = new Date().getTime() / 1000;

    it("should insert a row in test db", function() {
    	var insertRow = {code: "0001", title: "test title", author: "test author", year: cur, copies: 999};
    	// insert a row
    	db.insert("test_table", insertRow);
    	db.commit();

    	var queryResult = db.query('test_table', {year: cur});

    	// should query one row
    	expect(queryResult).to.have.length(1);

    	// should attr match
    	expect(queryResult[0]).have.property("code").equal("0001");
    	expect(queryResult[0]).have.property("title").equal("test title");
    	expect(queryResult[0]).have.property("author").equal("test author");
    	expect(queryResult[0]).have.property("year").equal(cur);
    	expect(queryResult[0]).have.property("copies").equal(999);
    });

    it("should update a row in test db", function() {
    	
    	// update the insert row
    	// change the title to "Unknown"
    	db.update("test_table", {year: cur}, function(row) {
    	    row.title = "Unknown";
    	    return row;
    	});

    	var queryResult = db.query("test_table", {year: cur});

    	// should title change to Unknown
    	expect(queryResult[0]).have.property("title").equal("Unknown");
    });

    it("should delete a row in test db", function() {
    	db.deleteRows("test_table", {year: cur});
    	db.commit();

    	var queryResult = db.query('test_table', {year: cur});

    	// should no row return
    	expect(queryResult).to.have.length(0);
    });

  });

});

function getTestDB(){

	var db = new localStorageDB("test_db", localStorage);
	if(db.tableExists("test_table")) db.dropTable("test_table");
	db.commit();

    // create the "books" table
    db.createTable("test_table", ["code", "title", "author", "year", "copies"]);

    // insert some data
    db.insert("test_table", {code: "B001", title: "Phantoms in the brain", author: "Ramachandran", year: 1999, copies: 10});
    db.insert("test_table", {code: "B002", title: "The tell-tale brain", author: "Ramachandran", year: 2011, copies: 10});
    db.insert("test_table", {code: "B003", title: "Freakonomics", author: "Levitt and Dubner", year: 2005, copies: 10});
    db.insert("test_table", {code: "B004", title: "Predictably irrational", author: "Ariely", year: 2008, copies: 10});
    db.insert("test_table", {code: "B005", title: "Tesla: Man out of time", author: "Cheney", year: 2001, copies: 10});
    db.insert("test_table", {code: "B006", title: "Salmon fishing in the Yemen", author: "Torday", year: 2007, copies: 10});
    db.insert("test_table", {code: "B007", title: "The user illusion", author: "Norretranders", year: 1999, copies: 10});
    db.insert("test_table", {code: "B008", title: "Hubble: Window of the universe", author: "Sparrow", year: 2010, copies: 10});

    db.commit();

    return db;
}