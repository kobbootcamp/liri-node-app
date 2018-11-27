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




inquirer.prompt([

    {
        type: "list",
        message: "What would you like to do?",
        choices: ["concert-this", "spotify-this-song", "movie-this", "do-what-it-says"],
        name: "doStuff"
    }
]).then(function (firstResponse) {

    switch (firstResponse.doStuff) {
        case "concert-this":
            messagePrompt = "What is the name of the artist/band?"
            autoPlayMessage = ""
            break;
        case "spotify-this-song":
            messagePrompt = "What is the name of the song?"
            autoPlayMessage = "Do you want to listen to this song?"
            break;
        case "movie-this":
            messagePrompt = "What is the name of the movie?"
            autoPlayMessage = "Do you want to see the poster?"
            break;
        case "do-what-it-says":
            messagePrompt = "Okay, I'll do what it says."
            autoPlayMessage = ""
            break;
    }
    
    inquirer.prompt([
        {
            type: "input",
            message: messagePrompt,
            name: "artist"
        },
        {
            type: "confirm",
            message: autoPlayMessage,
            name: "confirm",
            default: true
        }

        // After the prompt, store the user's response in a variable called location.
    ]).then(function (response) {

        // console.log(response.artist)
        var userResponse = response.artist;
        var autoPlay = response.confirm;

        switch (firstResponse.doStuff) {
            case "concert-this":
                findVenue(userResponse);
                break;
            case "spotify-this-song":
                findSong(userResponse, autoPlay);
                break;
            case "movie-this":
            // console.log(userResponse, autoPlay);
                findMovie(userResponse, autoPlay);
                break;
            case "do-what-it-says":
            doWhatItSays()
                // messagePromt = "Okay, I'll do what it says."
                break;
        }

    });




});


function findVenue(bandName) {

    axios.get("https://rest.bandsintown.com/artists/" + bandName + "/events?app_id=13722599&date=upcoming")
        .then(function (bitResponse) {
            console.log(bandName + " will play at " + bitResponse.data[0].venue.name + " in " + bitResponse.data[0].venue.city + " on " + moment(bitResponse.data[0].datetime).format("MMMM Do YYYY, h:mm:ss a"))
        })
        .catch(function (err) {
            console.log(err);
        })
};


function findSong(songName, autoPlay) {

    //Artist
    //song's name
    //preview link
    //album

    spotify.search({ type: 'track', query: songName })
        .then(function (response) {
            //   console.log(response.tracks);

            console.log("TRACK: " + response.tracks.items[0].name);
            console.log("ARTIST: " + response.tracks.items[0].artists[0].name);
            console.log("ALBUM: " + response.tracks.items[0].album.name);
            console.log("URL: " + response.tracks.items[0].external_urls.spotify);


            if (autoPlay) {

                //wait to seconds, then play song
                // setTimeout(function () {
                countdownToPlay()
                   opn(response.tracks.items[0].external_urls.spotify);

            //    }, 1000);
                
            }
            //   console.log(response.tracks);

        })
        .catch(function (err) {
            console.log(err);
        });
}


function findMovie(movieName, autoPlay) {


    axios.get("http://www.omdbapi.com/?t=" + movieName + "&apikey=44a67c37")
        .then(function (response) {
            console.log("MOVIE TITLE: " + response.data.Title)
            console.log("YEAR: " + response.data.Year)
            console.log("RATED: " + response.data.Rated)
            console.log("IMDB Rating: " + response.data.imdbRating)
            // console.log("ROTTEN TOMATOES RATING: " + response.data.Ratings[1].Value)
            console.log("COUNTRY: " + response.data.Country)
            console.log("PLOT: " + response.data.Plot)
            console.log("ACTORS: " + response.data.Actors)
            console.log("POSTER: " + response.data.Poster)


            if (autoPlay) {
                // countdownToPlay()
                setTimeout(function () {
                    opn(response.data.Poster);
                }, 1000);
                
            }
        })
        .catch(function (err) {
            console.log(err);
        })
};

function countdownToPlay () {
// console.log ("playing in...")
    setTimeout(function () {
                    
    console.log ("3...")

    setTimeout(function () {
                    
        console.log ("2...")
    
        setTimeout(function () {
                    
            console.log ("1...")
        
            }, 1000);


        }, 750);


    }, 500);




};


function doWhatItSays() {

    fs.readFile("random.txt", "utf8", function(error, data) {

        // If the code experiences any errors it will log the error to the console.
        if (error) {
          return console.log(error);
        }
            
        var dataArr = data.split(",");
 
        // console.log(dataArr);

        switch (dataArr[0]) {
            case "concert-this":
                findVenue(dataArr[1]);
                break;
            case "spotify-this-song":
                findSong(dataArr[1], null);
                break;
            case "movie-this":
            // console.log(userResponse, autoPlay);
                findMovie(dataArr[1], null);
                break;
            case "do-what-it-says":
                console.log("I'm already doing that.")
                // messagePromt = "Okay, I'll do what it says."
                break;
        }
      
      });
    }











