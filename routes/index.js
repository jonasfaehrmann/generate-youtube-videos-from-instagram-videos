let express = require("express");
let router = express.Router();
let {google} = require('googleapis');
let authYoutube = require("../helper/authYoutube");

router.get("/upload", function(req, res) {
	res.render("dashboard/index");
	authYoutube(uploadVideo);
});

router.get("/:id", function(req, res) {
    let id = req.sanitize(req.params.id);
});

/**
 * 
 * @param {*} authYoutube parameter filled by authYoutube.js 
 * @param {*} video file
 * https://developers.google.com/youtube/v3/docs/videos/insert
 */
function uploadVideo(authYoutube, video){
  let service = google.youtube('v3');
  
  let parameters = removeEmptyParameters(video['params']);
  parameters['authYoutube'] = authYoutube;
  parameters['media'] = { body: fs.createReadStream(video['mediaFilename']) };
  parameters['notifySubscribers'] = false;
  parameters['resource'] = createResource(video['properties']);
  
  service.videos.insert(parameters, function(err, data) {
    if (err) {
      console.log('The API returned an error: ' + err);
    }
    if (data) {
      console.log(util.inspect(data, false, null));
    }
    process.exit();
  });

  let fileSize = fs.statSync(video['mediaFilename']).size;
  // show some progress
  let id = setInterval(function () {
    let uploadedBytes = req.req.connection._bytesDispatched;
    let uploadedMBytes = uploadedBytes / 1000000;
    let progress = uploadedBytes > fileSize
        ? 100 : (uploadedBytes / fileSize) * 100;
    process.stdout.clearLine();
    process.stdout.cursorTo(0);
    process.stdout.write(uploadedMBytes.toFixed(2) + ' MBs uploaded. ' +
       progress.toFixed(2) + '% completed.');
    if (progress === 100) {
      process.stdout.write('Done uploading, waiting for response...');
      clearInterval(id);
    }
  }, 250);
}

function getChannel(authYoutube) {
  let service = google.youtube('v3');
  service.channels.list({
    authYoutube: authYoutube,
    part: 'snippet,contentDetails,statistics',
    forUsername: 'GoogleDevelopers'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    let channels = response.data.items;
    if (channels.length == 0) {
      console.log('No channel found.');
    } else {
      console.log('This channel\'s ID is %s. Its title is \'%s\', and ' +
                  'it has %s views.',
                  channels[0].id,
                  channels[0].snippet.title,
                  channels[0].statistics.viewCount);
    }
  });
}

module.exports = router;
