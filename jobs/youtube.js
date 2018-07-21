let cron = require('node-cron');
let path = require('path');
let fs = require('fs');
let {google} = require('googleapis');
let authYoutube = require("../helper/authYoutube");

/**
 * Cron job running every second weekday
 */
//1,3,5,7
function startCron(){
  //cron.schedule('* 3 * * * *', function(){

// Load client secrets from a local file.
    fs.readFile(path.join(__dirname, '../oauth2.keys.json'), function processClientSecrets(err, content) {
        if (err) {
          console.log('Error loading client secret file: ' + err);
          return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        authYoutube(JSON.parse(content), getChannel);
    });
  //});
}


/**
 * 
 * @param {*} authYoutube parameter filled by authYoutube.js 
 * @param {*} video file
 * https://developers.google.com/youtube/v3/docs/videos/insert
 */
function uploadVideo(authYoutube){

    let video = {
        'mediaFilename' : path.join(__dirname, '../output/test.mp4'),
        'properties' : {
            'status' : {
                'privacyStatus' : 'private'
            }
        },
        'snippet' : {
            'title' : 'test video',
            'description' : 'test',
            "categoryId": "22"
        },
        'params' : {
            'part' : 'snippet,status'
        }
    }

    let service = google.youtube('v3');

    console.log(authYoutube);

    let parameters = removeEmptyParameters(video['params']);
    parameters['authYoutube'] = authYoutube;
    parameters['media'] = { body: fs.createReadStream(video['mediaFilename']) };
    parameters['notifySubscribers'] = false;
    parameters['resource'] = createResource(video['properties']);
    
    let req = service.videos.insert(parameters, function(err, data) {
        if (err) {
          console.log('The API returned an error: ' + err);
        }
        if (data) {
          console.log(util.inspect(data, false, null));
        }
        process.exit();
    });
/*
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
    }, 250);*/
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


/**
 * Remove parameters that do not have values.
 *
 * @param {Object} params A list of key-value pairs representing request
 *                        parameters and their values.
 * @return {Object} The params object minus parameters with no values set.
 */
function removeEmptyParameters(params) {
    for (var p in params) {
      if (!params[p] || params[p] == 'undefined') {
        delete params[p];
      }
    }
    return params;
  }

  /**
 * Create a JSON object, representing an API resource, from a list of
 * properties and their values.
 *
 * @param {Object} properties A list of key-value pairs representing resource
 *                            properties and their values.
 * @return {Object} A JSON object. The function nests properties based on
 *                  periods (.) in property names.
 */
function createResource(properties) {
    var resource = {};
    var normalizedProps = properties;
    for (var p in properties) {
      var value = properties[p];
      if (p && p.substr(-2, 2) == '[]') {
        var adjustedName = p.replace('[]', '');
        if (value) {
          normalizedProps[adjustedName] = value.split(',');
        }
        delete normalizedProps[p];
      }
    }
    for (var p in normalizedProps) {
      // Leave properties that don't have values out of inserted resource.
      if (normalizedProps.hasOwnProperty(p) && normalizedProps[p]) {
        var propArray = p.split('.');
        var ref = resource;
        for (var pa = 0; pa < propArray.length; pa++) {
          var key = propArray[pa];
          if (pa == propArray.length - 1) {
            ref[key] = normalizedProps[p];
          } else {
            ref = ref[key] = ref[key] || {};
          }
        }
      };
    }
    return resource;
  }
  
  
/**
 * catch unhandled promises
 */
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})

module.exports = startCron;