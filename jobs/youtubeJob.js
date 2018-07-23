let cron = require('node-cron');
let path = require('path');
let fs = require('fs');
let youtubeService = require("../services/youtubeService");
let authYoutube = require("../helper/authYoutube");

/**
 * Cron job running every second weekday
 */
//1,3,5,7
function startCron(){
  //cron.schedule('* 3 * * * *', function(){
    fs.readFile(path.join(__dirname, '../oauth2.keys.json'), function processClientSecrets(err, content) {
        if (err) {
          console.log('Error loading client secret file: ' + err);
          return;
        }
        // Authorize a client with the loaded credentials, then call the YouTube API.
        authYoutube(JSON.parse(content), youtubeService.uploadVideo);
    });
// Load client secrets from a local file.
  //});
} 
  
/**
 * catch unhandled promises
 */
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})

module.exports = startCron;