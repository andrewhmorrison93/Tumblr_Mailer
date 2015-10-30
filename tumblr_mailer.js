//adds the fs module (allows us to read files from computer)
var fs = require("fs");
//adds the ejs module (allows us to use template engine) 
var ejs = require("ejs");
//require the apiKeys file, which has all the keys in it (and the require for tumblr and mandrill APIs)
var apiKeys = require("./apiKeys.js");
//stores the contents of "friend_list.csv" as a string of text
var csvFile = fs.readFileSync("friend_list.csv", "utf8");
//stores the contents of "email_template.ejs" as a string of text
var emailTemplate = fs.readFileSync("email_template.ejs", "utf8");

//defines a function to parse CSV files
function csvParse(csvFile) {
  //Define starting variables
  //Defines an array to push your friends' info to
	var arrayOfObjects = [];
  //Defines a friendObj to store your friends' info in
	var friendObj;

  	//split the file by new line into an array of strings
	var csvArray = csvFile.split("\n");

  	//chop off the first array element, then split the first array element into its own array [these will be the object keys]
   	var keys = csvArray.shift().split(",");
   
    //loop through each element of csvArray
    csvArray.forEach(function(element) {
      //for every element of csvArray, set Obj equal to an empty object
      friendObj = {};
      
      //make the passed-in element (i.e., the string of values) into an array of values
      element = element.split(",");
      
      //loop through every value and then assign it to its corresponding key within the Object
      for (var i = 0; i<element.length; i++) {
        friendObj[keys[i]] = element[i];
      }
      
      //push the newly built object to the array of Objects
      arrayOfObjects.push(friendObj);
    });
     
    //return the array of objects
    return arrayOfObjects;
}


//get most recent posts
apiKeys.client.posts("andrewhmorrison.tumblr.com", function(error, blog){
  var latestPosts = [];
  //define a variable that is equal to the date eight days ago from any given today [getting 8 days ago instead of 7 allows us to eventually see if the postDate is within (non inclusive) 8 days, without dealing with all of the minutiae of milliseconds if the post was posted EXACTLY seven days ago]
  var eightDaysAgo = new Date();
  eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);

  //loop through each blog post, checking to see if it is within the last 7 days, pushing it to an array if it is
  blog.posts.forEach(function(post) {
      //define a variable to push an object of a new Post within the timeframe
      var newPost;

      //get the date of the post in the right format to compare;
      var postDate = post.date.split(" ")[0].split("-");
      var postDate = new Date(postDate[0], postDate[1]-1, postDate[2]);

      //compare postDate to eightDaysAgo to see if postDate is sooner (non inclusive [i.e., not >=] so that we only have to deal with the range of 7 or fewer)
      if (postDate > eightDaysAgo) {
          //create a newPost object and populate it with the data we want
          newPost = {};
          newPost.href = post.post_url; //gets the url of the post and stores it
          newPost.title = post.title; //gets the title of the post and stores it
          latestPosts.push(newPost); //adds the post to the latestPosts array
      }
  })

  //store the data from csvFile in an easy to use array of objects
  var friendData = csvParse(csvFile);

  //loop through friendData, uses the data in friendData to replace the placeholder variables in email_template.ejs, and then sends each "friend" your filled in blog post email
  friendData.forEach(function(friend){
      //copy firstName and numMonthsSinceContact into variables for easier readability and access
      var firstName = friend["firstName"];
      var numMonthsSinceContact = friend["numMonthsSinceContact"];
      var copyTemplate = emailTemplate;
      //renders the template using ejs and then passes in the values we want
      var customizedTemplate = ejs.render(copyTemplate, 
      {
        firstName: firstName,
        numMonthsSinceContact: numMonthsSinceContact,
        latestPosts: latestPosts
      });

      //calls sendEmail function to send your most recent blog posts to your friends
      sendEmail(firstName, friend["emailAddress"], "Andrew Morrison", "andrewhmorrison93@gmail.com", "test", customizedTemplate);

  });

});


//builds a function to send emails using Mandrill API
function sendEmail(to_name, to_email, from_name, from_email, subject, message_html){
    var message = {
        "html": message_html,
        "subject": subject,
        "from_email": from_email,
        "from_name": from_name,
        "to": [{
                "email": to_email,
                "name": to_name
            }],
        "important": false,
        "track_opens": true,    
        "auto_html": false,
        "preserve_recipients": true,
        "merge": false,
        "tags": [
            "Fullstack_Tumblrmailer_Workshop"
        ]    
    };
    var async = false;
    var ip_pool = "Main Pool";
    apiKeys.mandrill_client.messages.send({"message": message, "async": async, "ip_pool": ip_pool}, function(result) {
        // console.log(message);
        // console.log(result);   
    }, function(e) {
        // Mandrill returns the error as an object with name and message keys
        console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
        // A mandrill error occurred: Unknown_Subaccount - No subaccount exists with the id 'customer-123'
    });
 }
