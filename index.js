const fs = require('fs');

async function sendToDiscordWebhook(resultFile) {
    fs.readFile(resultFile, 'utf8', (err, data) => {
        if (err) {
          console.error('File read error:', err);
          return;
        }
      
        try {
          const results = JSON.parse(data);
      
          console.log(results);
      
          const title = results.results[0].suites[0].title;
          console.log(title);
        } catch (err) {
          console.error('JSON parse error:', err);
        }
      });
}