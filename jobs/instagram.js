let cron = require('node-cron');
let save = require('instagram-save');
let path = require('path');
let fs = require('fs');
let readline = require('readline');

/**
 * Cron job running every second weekday
 */
//1,3,5,7

function startCron(){
  cron.schedule('10 * * * * *', function(){
      
    let data = [];

    const rl = readline.createInterface({
      input: fs.createReadStream(path.join(__dirname, '..') + '/urls.txt', 'utf8')
    });

    rl.on('line', function (line) {
      data.push(line);
    }).on('close', function() {
      console.log(data);
      processArray(data);
    });
  });
}

async function processArray(array){
  for(const item of array){
    await save(item, path.join(__dirname, '../videos'));
  }
}

process.on('unhandledRejection', (reason, promise) => {
  console.log('Unhandled Rejection at:', reason.stack || reason)
})

module.exports = startCron;