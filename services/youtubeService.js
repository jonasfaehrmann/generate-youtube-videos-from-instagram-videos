let {google} = require('googleapis');
let path = require('path');
let fs = require('fs');
let util = require('util');

/**
 * 
 * @param {*} authYoutube parameter filled by authYoutube.js 
 * @param {*} video file
 * https://developers.google.com/youtube/v3/docs/videos/insert
 */
function uploadVideo(authYoutube){

    let video = {
        'mediaFilename' : path.join(__dirname, '../videos/output/test.mp4'),
        'properties' : {
            'status' : {
                'privacyStatus' : 'public'
            },
            'snippet' : {
                'title' : 'Fail Compilation | hypedComp',
                'description' : `
                Another fire compilation
                **********************************
                Watch more videos from hypedComp.
                https://www.youtube.com/channel/UCx8o_z7htF0Wb26iRfRVYQA
                `,
                "categoryId": "22"
            }
        },  
        'params' : {
            'part' : 'snippet,status'
        }
    }

    let service = google.youtube('v3');

    let parameters = removeEmptyParameters(video['params']);
    parameters['auth'] = authYoutube;
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
      auth: authYoutube,
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

  module.exports.uploadVideo = uploadVideo;
  module.exports.getChannel = getChannel;