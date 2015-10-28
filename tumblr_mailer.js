var fs = require("fs");

var csvFile = fs.readFileSync("friend_list.csv", "utf8");

var emailTemplate = fs.readFileSync("email_template.html", "utf8");

function csvParse(csvFile) {
  //Define starting variables
	var arrayOfObjects = [];
	var Obj;

  	//split the file by new line into an array of strings
	var csvArray = csvFile.split("\n");

  	//chop off the first array element, then split the first array element into its own array [these will be the object keys]
   	var keys = csvArray.shift().split(",");
   
    //loop through each element of csvArray
    csvArray.forEach(function(element) {
      //for every element of csvArray, set Obj equal to an empty object
      Obj = {};
      
      //make the passed-in element (i.e., the string of values) into an array of values
      element = element.split(",");
      
      //loop through every value and then assign it to its corresponding key within the Object
      for (var i = 0; i<element.length; i++) {
        Obj[keys[i]] = element[i];
      }
      
      //push the newly built object to the array of Objects
      arrayOfObjects.push(Obj);
    });
     
    //return the array of objects
    return arrayOfObjects;
}

//store the data from csvFile in an easy to use array of objects
var friendData = csvParse(csvFile);

//loop through friendData and use the data in friendData to replace the placeholder variables in email_template.html
friendData.forEach(function(friend){
    //copy firstName and numMonthsSinceContact into variables for easier readability and access
    var firstName = friend["firstName"];
    var numMonthsSinceContact = friend["numMonthsSinceContact"];

    //copy emailTemplate into a variable so that we don't edit the original template text (as we will need it for many emails)
    var templateCopy = emailTemplate;

    //use .replace to replace placeholder variables (FIRST_NAME & NUM_MONTHS_SINCE_CONTACT) with the real content (firstName && numMonthsSinceContact)
    templateCopy = templateCopy.replace(/FIRST_NAME/gi, firstName).replace(/NUM_MONTHS_SINCE_CONTACT/gi, numMonthsSinceContact);

    console.log(templateCopy);

});