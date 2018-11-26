var dotenv = require("dotenv").config();
var inquirer = require("inquirer")
var Spotify = require('node-spotify-api');
var moment = require("moment");
var axios = require("axios");
var messagePrompt = ""
var keys = require("./keys.js");
const opn = require('opn');
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
            messagePrompt = "What is the name of the artist?"
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
            console.log(userResponse, autoPlay);
                findMovie(userResponse);
                break;
            case "do-what-it-says":
                messagePromt = "Okay, I'll do what it says."
                break;
        }

        // findVenue(band)
        // console.log(location.userInput);
        // var artist = response.artist;

        // axios.get("https://rest.bandsintown.com/artists/" + artist + "/events?app_id=13722599&date=upcoming")
        //     .then(function (bitResponse) {
        //         // console.log(JSON.stringify(response, null,2))
        //         console.log(artist + " will play at " + bitResponse.data[0].venue.name + " in " + bitResponse.data[0].venue.city + " on " + moment(bitResponse.data[0].datetime).format("MMMM Do YYYY, h:mm:ss a"))

        //     })
        //     .catch(function (err) {
        //         console.log(err);
        //     })
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
                opn(response.tracks.items[0].external_urls.spotify)
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
            console.log("ROTTEN TOMATOES RATING: " + response.data.Ratings[1].Value)
            console.log("COUNTRY: " + response.data.Country)
            console.log("PLOT: " + response.data.Plot)
            console.log("ACTORS: " + response.data.Actors)
            // console.log("POSTER: " + response.data.Poster)


            if (autoPlay) {
                opn(response.data.Poster)
            }
        })
        .catch(function (err) {
            console.log(err);
        })
};












