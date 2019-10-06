const zlib = require('zlib');
const gzip = zlib.createGzip();
const fs = require('fs');
const inp = fs.createReadStream('input.txt');
const out = fs.createWriteStream('input.txt.gz');

inp.pipe(gzip)
  .on('error', () => {
    // handle error
    console.log('A');
  })
  .pipe(out)
  .on('error', () => {
    // handle error
    console.log('B');
  });



const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');

const app = express();

// // TODO: Enter the path to your service account json file
// // Need help with this step go here: https://firebase.google.com/docs/admin/setup
// const serviceAccount = require("./firebase-info.json");

// // TODO: Enter your database url from firebase
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL: "https://vehelmd.firebaseio.com"
// });



// var admin = require('firebase-admin');
const firstServiceAccount = require('./firebase-info.json');
const secondServiceAccount = require('./firebase-info-2.json');

const _first = admin.initializeApp(
  {
    credential: admin.credential.cert(firstServiceAccount),
    databaseURL: 'https://vehelmd.firebaseio.com'
  }, 
  '_first' // this name will be used to retrieve firebase instance. E.g. first.database();
);

const _secound = admin.initializeApp(
  {
    credential: admin.credential.cert(secondServiceAccount),
    databaseURL: 'https://backupvehelmd.firebaseio.com'
  }, 
  '_secound' // this name will be used to retrieve firebase instance. E.g. second.database();
);

// exports.first = _first;
// exports.second = _second;

const first = _first.database();
const secound = _secound.database();



// Setup
// Change the default port here if you want for local dev.
app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/dist'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

app.get('/:user', function(req, res) {
  //return res.send('Madden Data')
  return res.send("username is set to " + req.params.user);
});

//Clear firebase database
app.get('/delete/:user', function(req, res) {
  const db = first;
  const db2 = secound;
  const ref = db.ref();
  const ref2 = db2.ref();
  const dataRef = ref.child(req.params.user);
  const dataRef2 = ref2.child(req.params.user);
  dataRef.remove();
  dataRef2.remove();
  return res.send('Madden Data Cleared for ' + req.params.user);
});



app.post('/:username/:platform/:leagueId/leagueteams', (req, res) => {
  const db = first;
  const db2 = secound;
  const ref = db.ref();
  const ref2 = db2.ref();
  const { params: { username } } = req;  
  const {platform, leagueId} = req.params;
  const dataRef = ref.child(`${username}/data/leagueteams`);
  const dataRef2 = ref2.child(`${username}/data/leagueteams`);
  const {body: {leagueTeamInfoList}} = req;
  

  dataRef.set({
    leagueTeamInfoList
  });
  dataRef2.set({
    leagueTeamInfoList
  });
  res.on('finish', clearTimer);
  res.sendStatus(200);
  console.log("tasoeur");
});

app.post('/:username/:platform/:leagueId/standings', (req, res) => {
  const db = first;
  const db2 = secound;
  const ref = db.ref();
  const ref2 = db2.ref();
  const { params: { username } } = req;  
  const {platform, leagueId} = req.params;
  const dataRef = ref.child(`${username}/data/standings`);
  const dataRef2 = ref2.child(`${username}/data/standings`);
  const {body: {teamStandingInfoList}} = req;

  dataRef.set({
    teamStandingInfoList
  });
  dataRef2.set({
    teamStandingInfoList
  });
  res.on('finish', clearTimer);
  res.sendStatus(200);
  console.log("tonfrere");
});





app.post('/:username/:platform/:leagueId/week/:weekType/:weekNumber/:dataType', (req, res) => {
  const db = first;
  const db2 = secound;
  const ref = db.ref();
  const ref2 = db2.ref();
  const { params: { username } } = req;  
  const {platform, leagueId, weekType, weekNumber, dataType} = req.params;
  const dataRef = ref.child(`${username}/data/week/${weekType}/${weekNumber}/${dataType}`);
  const dataRef2 = ref2.child(`${username}/data/week/${weekType}/${weekNumber}/${dataType}`);
  const dataRefB = ref.child(`${username}/data/justSchedule/${weekType}/${weekNumber}/${dataType}`);
  const dataRefB2 = ref2.child(`${username}/data/justSchedule/${weekType}/${weekNumber}/${dataType}`);

  // method=POST path="/platform/leagueId/week/reg/1/defense"
  // method=POST path="/platform/leagueId/week/reg/1/kicking"
  // method=POST path="/platform/leagueId/week/reg/1/passing"
  // method=POST path="/platform/leagueId/week/reg/1/punting"
  // method=POST path="/platform/leagueId/week/reg/1/receiving"
  // method=POST path="/platform/leagueId/week/reg/1/rushing"

  switch(dataType) {
    case 'schedules':
      const {body: {gameScheduleInfoList}} = req;
      dataRefB.set({
        gameScheduleInfoList
      });
      dataRef.set({
        gameScheduleInfoList
      });
      dataRefB2.set({
        gameScheduleInfoList
      });
      dataRef2.set({
        gameScheduleInfoList
      });
      break;
    case 'teamstats':
      const {body: {teamStatInfoList}} = req;
      dataRefB.set({
        teamStatInfoList
      });
      dataRef.set({
        teamStatInfoList
      });
      dataRefB2.set({
        teamStatInfoList
      });
      dataRef2.set({
        teamStatInfoList
      });
      break;
    case 'defense':
      const {body: {playerDefensiveStatInfoList}} = req;
      dataRef.set({
        playerDefensiveStatInfoList
      });
      dataRef2.set({
        playerDefensiveStatInfoList
      });
      break;
    default:
      const {body} = req;
      const property = `player${capitalizeFirstLetter(dataType)}StatInfoList`;
      dataRef.set({
        [property]: body[property] || ''
      });
      dataRef2.set({
        [property]: body[property] || ''
      });
      break;
  }
  res.on('finish', clearTimer);
  res.sendStatus(200);
  console.log("taniece");
});




// ROSTERS

app.post('/:username/:platform/:leagueId/freeagents/roster', (req, res) => {
  const db = first;
  const db2 = secound;
  const ref = db.ref();
  const ref2 = db2.ref();
  const { params: { username } } = req;  
  const {platform, leagueId} = req.params;
  const dataRef = ref.child(`${username}/data/freeagents`);
  const dataRef2 = ref2.child(`${username}/data/freeagents`);
  const {body: {rosterInfoList}} = req;
  res.sendStatus(202);
  dataRef.set({
    rosterInfoList
  });
  dataRef2.set({
    rosterInfoList
  });
  res.on('finish', clearTimer);
  console.log("tonneveu");
});

app.post('/:username/:platform/:leagueId/team/:teamId/roster', (req, res) => {
  const db = first;
  const db2 = secound;
  const ref = db.ref();
  const ref2 = db2.ref();
  const { params: { username } } = req;  
  const {platform, leagueId, teamId} = req.params;
  const dataRef = ref.child(`${username}/data/team/${teamId}`);
  const dataRef2 = ref2.child(`${username}/data/team/${teamId}`);
  const {body: {rosterInfoList}} = req;
  res.sendStatus(202);
  dataRef.set({
    rosterInfoList
  });
  dataRef2.set({
    rosterInfoList
  });
  res.on('finish', clearTimer);
  console.log("tacousine");
});

console.log("fini");

function minifyFiles(){
  console.log("dans le minifyer");
  var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  var http = new XMLHttpRequest();
  var url = 'https://www.liguefff.com/firebase/minifyer.php';
if (!http) {
  console.log('Abandon :( Impossible de créer une instance de XMLHTTP');
  return false;
}

http.open('GET', url, true);
http.send();
};

function launchSave(){
    console.log("dans le timeout");
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
    var http = new XMLHttpRequest();
    var url = 'https://www.liguefff.com/firebase/upload.php';
  if (!http) {
    console.log('Abandon :( Impossible de créer une instance de XMLHTTP');
    return false;
  }

  
  http.open('GET', url, true);
  http.send();

  setTimeout(function() {minifyFiles()}, 15000);
//   if (http.status === 200) {
//     console.log("Réponse reçue: %s", req.responseText);
// } else {
//     console.log("Status de la réponse: %d (%s)", http.status, http.statusText);
// }
};


var timeoutHandle = setTimeout(function() {launchSave()}, 45000);

// in your click function, call clearTimeout

function clearTimer() {
	clearTimeout(timeoutHandle);

	// then call setTimeout again to reset the timer
	timeoutHandle = setTimeout(function() {launchSave()}, 45000);
}


app.listen(app.get('port'), function() { console.log('Madden Companion Exporter is running on port', app.get('port')) });
