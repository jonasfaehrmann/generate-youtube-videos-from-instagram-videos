let cron = require('node-cron');
let save = require('instagram-save');
let path = require('path');
let fs = require('fs');
let readline = require('readline');
let concat = require('ffmpeg-concat');

let INTRO_PATH = path.join(__dirname,'../videos/intro/intro.mp4');

/**
 * Cron job running every second weekday
 */
//1,3,5,7
function startCron(){
  //cron.schedule('* 3 * * * *', function(){
      
    let data = [];

    const rl = readline.createInterface({
      input: fs.createReadStream(path.join(__dirname, '..') + '/urls.txt', 'utf8')
    });

    rl.on('line', function (line) {
      data.push(line);
    }).on('close', function() {
      console.log(data);
      processArray(data, mergeVideos);
    });
  //});
}

/**
 * Process array async in parallel
 * @param {*} array 
 */
async function processArray(array, callback){
  for(const item of array){
    await save(item, path.join(__dirname, '../videos/cache'));
  }
  callback();
}

/**
 * Merge videos with ffmpeg library and put them into output folder
 */
function mergeVideos(){
  
  fs.readdir(path.join(__dirname, '../videos/cache'), async function(err, items) {
    
    //MAC OS fix: remove .DS_Store file name from list
    if(items[0] === ".DS_Store"){
      items.shift();
    }

    //Add intro to beginning of Video
    items.unshift(INTRO_PATH)

    await concat({
      //audio: path.join(__dirname,'../videos/music/dance.mp3'),
      output: path.join(__dirname, '../videos/output/test.mp4'),
      videos: items.map(i => (i !== INTRO_PATH) ? path.join(__dirname,'../videos/cache/') + i : i),
      frameFormat: 'png',
      transition: {
        name: 'directionalwipe',
        duration: 500
      }
    });

    console.log("Done");
  });

}

/**
 * catch unhandled promises
 */
process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})

module.exports = startCron;