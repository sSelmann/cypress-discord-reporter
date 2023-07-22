const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const { EmbedBuilder } = require('discord.js');

async function sendDiscordWebhook(webhookUrl, resultJSONFile) {
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

        const embed = new EmbedBuilder()
        .setColor(0x0099FF)
        .setTitle(title)
        .setAuthor({
          name: 'Cypress Discord Reporter',
          iconURL: 'https://i.imgur.com/KRxtcos.jpeg',
          url: 'https://github.com/sSelmann/Cypress-Discord-Reporter'
        })
        .setDescription('Test Results')
        .addFields(
          { name: 'Duration :clock4:', value: duration.toString(), inline: true },
          { name: 'Suites :card_box:', value: suitesCount.toString(), inline: true },
          { name: 'Tests :bookmark_tabs:', value: testCount.toString(), inline: true },
        )
        .addFields(
          { name: 'Passes :white_check_mark:', value: testPassesCount.toString(), inline: true },
          { name: 'Pending :hourglass_flowing_sand:', value: testPendingCount.toString(), inline: true },
          { name: 'Failures :x:', value: testFailuresCount.toString(), inline: true },
        )
        .setTimestamp();

        const form = new FormData();
        form.append('payload_json', JSON.stringify({ embeds: [embed] }));
    
        files.forEach((file, index) => {
          const fileStream = fs.createReadStream(file);
          form.append(`file${index}`, fileStream);
        });
    
        try {
          await axios.post(webhookUrl, form, {
            headers: {
              ...form.getHeaders(),
            },
          });
        } catch (error) {
          console.error('Error:', error.message);
        }

    } catch (err) {
        console.error('Error reading or parsing file:', err);
    }
}
module.exports = sendDiscordWebhook;