//variable declarations

var dotenv = require("dotenv").config();
var inquirer = require("inquirer")
var Spotify = require('node-spotify-api');
var moment = require("moment");
var axios = require("axios");
var messagePrompt = ""
var keys = require("./keys.js");
const opn = require('opn');
const fs = require('fs-extra')
var spotify = new Spotify(keys.spotify);



//initial prompt asking which action to take
inquirer.prompt([

    //provides a list with options
    {
        type: "list",
        message: "What would you like to do?",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"],
        name: "doStuff"
    }

    //then responds with a function
]).then(function (firstResponse) {

    //different actions depending on initial response
    switch (firstResponse.doStuff) {

        //if concert-this...
        case "concert-this":

            //change the variable to reflect the proper question
            messagePrompt = "What is the name of the artist/band?";

            //prompt the user for the arist of band name
            inquirer.prompt([
                {
                    type: "input",
                    message: messagePrompt,
                    name: "artist"
                }
            ]).then(function (response) {

                //load the user's response into a variable
                var userResponse = response.artist;

                //Call the findVenue function
                findVenue(userResponse);
                logResults(firstResponse.doStuff, userResponse, null);
            })
            
            break;

        //if spotify-this-song is the response...
        case "spotify-this-song":

            //load message prompt variable: ask the user for the name of the song
            messagePrompt = "What is the name of the song?"

            //load second message prompt: does user want to listen to song?
            autoPlayMessage = "Do you want to listen to this song?"
            inquirer.prompt([
                {
                    //input for name of artist/band
                    type: "input",
                    message: messagePrompt,
                    name: "artist"
                },
                {
                    //input to play song or not
                    type: "confirm",
                    message: autoPlayMessage,
                    name: "confirm",
                    default: true
                }

            ]).then(function (response) {

                //load responses into variables
                var userResponse = response.artist;
                var autoPlay = response.confirm;

                //Call findSong function with artist and autoplay boolean
                findSong(userResponse, autoPlay);
                logResults(firstResponse.doStuff, userResponse, autoPlay);
            })
            
            break;

        //if response is movie-this
        case "movie-this":

            //load message prompt variable: ask the user for the name of the song
            messagePrompt = "What is the name of the movie?"

            //load second message prompt: does user want to listen to song?
            autoPlayMessage = "Do you want to see the poster?"
            inquirer.prompt([
                {
                    //input for name of movie
                    type: "input",
                    message: messagePrompt,
                    name: "artist"
                },
                {
                    //input to seeing movie poster or not
                    type: "confirm",
                    message: autoPlayMessage,
                    name: "confirm",
                    default: true
                }

            ]).then(function (response) {

                //load responses into variables
                var userResponse = response.artist;
                var autoPlay = response.confirm

                //call the findMovie function
                findMovie(userResponse, autoPlay);
                logResults(firstResponse.doStuff, userResponse, autoPlay);
            })
            
            break;

        case "do-what-it-says":

            //let the user know you will do what it says
            console.log("Okay, I'll do what it says.")

            //call teh doWhatItSays function
            doWhatItSays();
            break;
    }
});

//**************************************************************************************
//FUNCTIONS BELOW
//**************************************************************************************


function findVenue(bandName) {
    //uses axios to call bandsintown API
    axios.get("https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=13722599&date=upcoming")
        .then(function (bitResponse) {

            //console logs the results
            console.log(bandName + " will play at " + bitResponse.data[0].venue.name + " in " + bitResponse.data[0].venue.city + " on " + moment(bitResponse.data[0].datetime).format("MMMM Do YYYY, h:mm:ss a"))
        })
        //cathes and display errors, if any
        .catch(function (err) {
            console.log(err);
        })
};

function findSong(songName, autoPlay) {
    //uses spotify  search to call spotify
    spotify.search({ type: 'track', query: songName })
        .then(function (response) {

            //console log the results
            console.log("TRACK: " + response.tracks.items[0].name);
            console.log("ARTIST: " + response.tracks.items[0].artists[0].name);
            console.log("ALBUM: " + response.tracks.items[0].album.name);
            console.log("URL: " + response.tracks.items[0].external_urls.spotify);

            //if autoplay is true, pause so notify the user and then use opn to play the track
            if (autoPlay) {
                countdownToPlay()
                opn(response.tracks.items[0].external_urls.spotify);
            }
        })
        //catch and display error(s), if any
        .catch(function (err) {
            console.log(err);
        });
}


function findMovie(movieName, autoPlay) {
    // uses axios to call omdb API
    axios.get("http://www.omdbapi.com/?t=" + movieName + "&apikey=44a67c37")
        .then(function (response) {

            //console log the results
            console.log("MOVIE TITLE: " + response.data.Title)
            console.log("YEAR: " + response.data.Year)
            console.log("RATED: " + response.data.Rated)
            console.log("IMDB Rating: " + response.data.imdbRating)
            console.log("ROTTEN TOMATOES RATING: " + response.data.Ratings[1].Value)
            console.log("COUNTRY: " + response.data.Country)
            console.log("PLOT: " + response.data.Plot)
            console.log("ACTORS: " + response.data.Actors)
            console.log("POSTER: " + response.data.Poster)


            if (autoPlay) {

                //if autoplay, pause for only a second and the display the poster
                setTimeout(function () {
                    opn(response.data.Poster);
                }, 1000);

            }
        })
        //catch and display errors, if any
        .catch(function (err) {
            console.log(err);
        })
};

function countdownToPlay() {

    //Pause and then return 
    setTimeout(function () {

        console.log("3...")

        setTimeout(function () {

            console.log("2...")

            setTimeout(function () {

                console.log("1...")

            }, 1000);


        }, 750);


    }, 500);


    return true;

};


function doWhatItSays() {

    fs.readFile("random.txt", "utf8", function (error, data) {

        // catch and display errors, if any
        if (error) {
            return console.log(error);
        }

        //create the data array by splitting 
        var dataArr = data.split(",");

        //determine what action we are doing
        switch (dataArr[0]) {
            case "concert-this":
                findVenue(dataArr[1]);
                break;
            case "spotify-this-song":
                findSong(dataArr[1], dataArr[2]);
                break;
            case "movie-this":
                // console.log(userResponse, autoPlay);
                findMovie(dataArr[1], dataArr[2]);
                break;
            case "do-what-it-says":
                console.log("I'm already doing that.")
                break;
        }
        logResults("do-what-it-says: " +  dataArr[0], dataArr[1],dataArr[2])
    });
    
};

// var fs = require("fs");

function logResults(action, response, autoplay) {

    var text = action + ", " + response + ", " + autoplay + "\n";

    fs.appendFile("log.txt", text, function (err) {

        if (err) {
            console.log(err);
        }

    })
};












