#! /usr/bin/env mode

// Get arguments passed on command line
var userArgs = process.argv.slice(2);
/*
if (!userArgs[0].startsWith('mongodb')) {
    console.log('ERROR: You need to specify a valid mongodb URL as the first argument');
    return
}
*/
var async = require('async')
const User = require('./models/user')
const Post = require('./models/post')


var mongoose = require('mongoose');
var mongoDB = userArgs[0];
mongoose.connect(mongoDB, {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.Promise = global.Promise;
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var consoles = []
var genres = []
var games = []
var gameInstances = []

function consoleCreate(name, release_year, manufacturer, discontinued, unit_sold, cb) {
  consoleDetail = {name: name}
  if (release_year != false) consoleDetail.release_year = release_year
  if (manufacturer != false) consoleDetail.manufacturer = manufacturer
  if (discontinued != false) consoleDetail.discontinued = discontinued
  if (unit_sold != false) consoleDetail.unit_sold = unit_sold
  
  var consoleVar = new Console(consoleDetail);
       
  consoleVar.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    console.log('New Console: ' + Console);
    consoles.push(consoleVar)
    cb(null, consoleVar)
  }  );
}

function genreCreate(name, cb) {
  var genre = new Genre({ name: name });
       
  genre.save(function (err) {
    if (err) {
      cb(err, null);
      return;
    }
    console.log('New Genre: ' + genre);
    genres.push(genre)
    cb(null, genre);
  }   );
}

function gameCreate(title, console, genre, developer, publisher, release_date, cost, cb) {
  gameDetail = { 
    title: title,
    console: console,
    genre: genre,
  }
  if (developer != false) gameDetail.developer = developer
  if (publisher != false) gameDetail.publisher = publisher
  if (release_date != false) gameDetail.release_date = release_date
  if (cost != false) gameDetail.cost = cost
    
  var game = new Game(gameDetail);    
  game.save(function (err) {
    if (err) {
      cb(err, null)
      return
    }
    //console.log('New Game: ' + game);
    games.push(game)
    cb(null, game)
  }  );
}


function gameInstanceCreate(game, status, cb) {
  gameInstanceDetail = { 
    game: game,
    status: status
  }    
  
  var gameInstance = new GameInstance(gameInstanceDetail);    
  gameInstance.save(function (err) {
    if (err) {
      console.log('ERROR CREATING GameInstance: ' + gameInstance);
      cb(err, null)
      return
    }
    console.log('New GameInstance: ' + gameInstance);
    gameInstances.push(gameInstance)
    cb(null, game)
  }  );
}
/*name, release_year, manufacturer, discontinued, unit_sold, cb*/
function createConsoleGenres(cb) {
    async.series([
        function(callback) {
          consoleCreate('Nintendo 64', 1996, 'Nintendo', 2002, "32.93 million", callback);
        },
        function(callback) {
          consoleCreate('PlayStation', 1994, 'Sony Electronics', 2006, "102.49 million", callback);
        },
        function(callback) {
          consoleCreate('PlayStation 2', 2000, 'Sony Electronics', 2013, '155.0 million', callback);
        },
        function(callback) {
          consoleCreate('Game Boy', 1989, 'Nintendo', 2003, '118.69 million', callback);
        },
        function(callback) {
          consoleCreate('Game Boy Advance', 2001, 'Nintendo',  2008, '81.51 million', callback);
        },
        function(callback) {
          genreCreate("Action-Adventure", callback);
        },
        function(callback) {
          genreCreate("Sports", callback);
        },
        function(callback) {
          genreCreate("Platformers", callback);
        },
        function(callback) {
          genreCreate("First Person Shooter", callback)
        },
        function(callback) {
          genreCreate("Racing", callback)
        },
        function(callback) {
          genreCreate("Role Playing Game", callback)
        },
        function(callback) {
          genreCreate("Survival Horror", callback)
        },
        ],
        // optional callback
        cb);
}


function createGames(cb) {
    async.parallel([
        function(callback) {
          let releaseDate = new Date("1999-08-31")
          gameCreate("Shadow Man", consoles[0], genres[0], "Acclaim Studios Teesside", "Acclaim Entertainment", releaseDate, "$30.00", callback);
        },
        function(callback) {
          let releaseDate = new Date("1998-11-21")
          gameCreate("Legend of Zelda: Ocarina of Time", consoles[0], genres[0], "Nintendo EAD", "Nintendo", releaseDate, "$40.00", callback)
        },
        function(callback) {
          let releaseDate = new Date("1996-09-29")
          gameCreate("Super Mario 64", consoles[0], genres[2], "Nintendo EAD", "Nintendo", releaseDate, "$50.00", callback)
        },
        function(callback) {
          let releaseDate = new Date("1999-10-15")
          gameCreate("Pac-Man World", consoles[1], genres[2], "Namco Hometek", "Namco", releaseDate, "$20.00", callback)
        },
        function(callback) {
          let releaseDate = new Date("1998-01-21")
          gameCreate("Resident Evil 2", consoles[1], genres[6], "Capcom", "Capcom", releaseDate, "$70.00", callback)
        },
        function(callback) {
          let releaseDate = new Date("1997-03-20")
          gameCreate("Castlevania: Symphony of the Night", consoles[1], genres[5], "Konami Computer Entertainment Tokyo", "Konami", releaseDate, "$200.00", callback)
        },
        function(callback) {
          let releaseDate = new Date("1999-02-12")
          gameCreate("Crazy Taxi", consoles[2], genres[4], "Hitmaker", "Sega", releaseDate, "$15.00", callback)
        },
        function(callback) {
          let releaseDate = new Date("2000-11-09")
          gameCreate("No One Lives Forever", consoles[2], genres[3], "Monolith Productions", "Sierra Entertainment", releaseDate, "$20.00", callback)
        },
        function(callback) {
          let releaseDate = new Date("2003-10-27")
          gameCreate("Tony Hawk's Underground", consoles[2], genres[1], "Neversoft", "Activision", releaseDate, "$15.00", callback)
        },
        function(callback) {
          let releaseDate = new Date("1998-09-28")
          gameCreate("Pokemon Red", consoles[3], genres[5], "Game Freak", "Nintendo", releaseDate, "$40.00", callback)
        },
        function (callback) {
          let releaseDate = new Date("1991-02")
          gameCreate("Operation C", consoles[3], genres[2], "Konami", "Ultra Games", releaseDate, "$40.00", callback)
        },
        function (callback) {
          let releaseDate = new Date("1996-09")
          gameCreate("Sword of Hope II", consoles[3], genres[5], "Kemco", "Kemco", releaseDate, "$200.00", callback)
        },
        function (callback) {
          let releaseDate = new Date("2001-09-19")
          gameCreate("Spider-Man: Mysterio's Menace", consoles[4], genres[0], "Vicarious Visions", "Activision", releaseDate, "$25.00", callback)
        },
        function (callback) {
          let releaseDate = new Date("2002-11-19")
          gameCreate("Revenge of Shinobi", consoles[4], genres[0], "3d6 Games", "THQ", releaseDate, "$15.00", callback)
        },
        function(callback) {
          let releaseDate = new Date("2003-04-15")
          gameCreate("X2: Wolverine's Revenge", consoles[4], genres[2], "Vicarious Visions", "Activision", releaseDate, "$20.00", callback)
        }
        ],
        // optional callback
        cb);
}

function createGameInstances(cb) {
    async.parallel([
        function(callback) {
          gameInstanceCreate(games[0], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[0], 'Avaiable', callback)
        },
        function(callback) {
          gameInstanceCreate(games[1], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[2], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[2], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[2], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[3], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[4], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[5], 'Sold Out', callback)
        },
        function(callback) {
          gameInstanceCreate(games[6], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[6], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[6], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[7], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[7], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[8], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[8], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[8], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[8], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[9], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[9], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[9], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[9], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[9], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[9], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[10], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[10], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[10], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[11], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[12], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[12], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[12], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[13], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[14], 'Available', callback)
        },
        function(callback) {
          gameInstanceCreate(games[14], 'Available', callback)
        },
        ],
        // Optional callback
        cb);
}

async.series([
    createConsoleGenres,
    createGames,
    createGameInstances,
],
// Optional callback
function(err, results) {
    if (err) {
        console.log('FINAL ERR: '+err);
    }
    else {
        console.log('GAMEInstances: '+gameInstances);
        
    }
    // All done, disconnect from database
    mongoose.connection.close();
});