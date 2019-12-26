function rowDelete(elem) {
    elem.parentNode.parentNode.remove();
    var textContainer =  elem.parentNode.parentNode.firstChild;
    var textValue = $(textContainer).text();
    db.deleteRows("mytable", {code: String(textValue)});
    db.commit();
}

$(document).ready(function(){

    var databaseName = "mydatabase";
    var tableName = "mytable";
    
    db = new localStorageDB(databaseName, localStorage);

    $("#tblContent > tbody").html("");

    if (db.tableExists(tableName))
    {
        var result = db.queryAll("mytable");
        $.each(result, function( index, value ) {
            var vCode = value.code;
            var vTitle = value.title;
            var vAuthor = value.author;
            var vYear = value.year;
            var vCopies = value.copies;
    
            var rowContent = '<tr><td>' + 
                vCode + '</td><td>' + 
                vTitle + '</td><td>' + 
                vAuthor + '</td><td>' + 
                vYear + '</td><td>' + 
                vCopies + '</td><td><a href="#" onclick="rowDelete(this); return false;">Delete</a></tr>';
    
            $("#tblContent tbody").append(rowContent);
        });    
    }

    $('#btnInsert').click(function(){

        
        if (! db.tableExists(tableName) )
        {
            db.createTable(tableName, ["code", "title", "author", "year", "copies"]);
        }

        var vCode   = $('#code').val();
        var vTitle  = $('#title').val();
        var vAuthor = $('#author').val();
        var vYear   = $('#year').val();
        var vCopies = $('#copies').val();

        db.insert(tableName, { code: String(vCode), 
                                title: String(vTitle), 
                                author: String(vAuthor), 
                                year: String(vYear), 
                                copies: String(vCopies) });

        db.commit();

        var newRowContent = '<tr><td>' + 
            vCode + '</td><td>' + 
            vTitle + '</td><td>' + 
            vAuthor + '</td><td>' + 
            vYear + '</td><td>' + 
            vCopies + '</td><td><a href="#" onclick="rowDelete(this); return false;">Delete</a></td></tr>';

        $("#tblContent tbody").append(newRowContent);
        $(':input').val('');

    });

});
