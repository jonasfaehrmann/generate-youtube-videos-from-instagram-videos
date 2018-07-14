let fs = require('fs');

let token = {};

function authorize(callback) {
    // Load Instagram token from a local file.
    fs.readFile('../credentials/token.json', function processClientSecrets(err, content) {
        if (err) {
        console.log('Error loading token file: ' + err);
        return;
        }else{
            token = JSON.parse(content);
            callback(token);
        }
    });
}
  