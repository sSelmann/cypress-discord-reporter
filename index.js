const fs = require('fs');

async function sendDiscordWebhook(resultJSONFile) {
    try {
        const data = await fs.promises.readFile(resultJSONFile, 'utf8');
        const resultData = JSON.parse(data);
    
        console.log(resultData);
    
        const passesArray = resultData.results[0].suites[0].title;
        console.log(passesArray);
    
        let duration = resultData.stats.duration;
        if (duration > 60000) {
          duration = duration / 60000;
          duration += 'm';
        } else {
          duration = duration / 1000;
          duration += 's';
        }
    
        const suitesCount = resultData.stats.suites;
        const testCount = resultData.stats.tests;
        const testPassesCount = resultData.stats.passes;
        const testPendingCount = resultData.stats.pending;
        const testFailuresCount = resultData.stats.failures;

        console.log(suitesCount, testCount, testPassesCount)

        
    } catch (err) {
        console.error('Error reading or parsing file:', err);
    }
}
module.exports = sendDiscordWebhook;