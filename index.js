const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const Chart = require('chart.js/auto');
const { createCanvas } = require('canvas');
const { EmbedBuilder, AttachmentBuilder } = require('discord.js');

function formatDuration(duration) {
    return duration > 60000 ? `${duration / 60000}m` : `${duration / 1000}s`;
}

function extractTestResults(resultData) {
    const testResults = [];
    for (const result of resultData.results) {
        for (const suite of result.suites) {
            const suiteTitle = suite.title;
            let test = '';
            for (const testItem of suite.tests) {
                const testTitle = testItem.title;
                const testStatus = testItem.state;
                test += `:receipt: **${testTitle}** ${testStatus === 'passed' ? '✅' : testStatus === 'pending' ? '⏳' : '❌'}\n`;
            }
            testResults.push({ suiteTitle, test });
        }
    }
    return testResults;
}

function drawDonutChart(successPercentage, failurePercentage) {
    const width = 100;
    const height = 100;
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    new Chart(ctx, {
        type: 'doughnut',
        data: {
            datasets: [{
                data: [successPercentage, failurePercentage],
                backgroundColor: ['green', 'red'],
                borderColor: '#2b2d31'
            }]
        }
    });

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync('./chart.png', buffer);
}

async function sendDiscordWebhook(webhookUrl, resultJSONFile, title) {
    try {
        const data = await fs.promises.readFile(resultJSONFile, 'utf8');
        const resultData = JSON.parse(data);
        const attachFiles = [];

        const duration = formatDuration(resultData.stats.duration);

        const suitesCount = resultData.stats.suites;
        const testCount = resultData.stats.tests;
        const testPassesCount = resultData.stats.passes;
        const testPendingCount = resultData.stats.pending;
        const testFailuresCount = resultData.stats.failures;

        const successPercentage = (testPassesCount / testCount) * 100;
        const failurePercentage = (testFailuresCount / testCount) * 100;

        drawDonutChart(successPercentage, failurePercentage);

        new AttachmentBuilder('./chart.png');
        attachFiles.push('./chart.png');

        const embed = new EmbedBuilder()
            .setColor(0x5eff00)
            .setTitle(title)
            .setAuthor({
                name: 'Cypress Discord Reporter',
                iconURL: 'https://i.imgur.com/KRxtcos.jpeg',
                url: 'https://github.com/sSelmann/Cypress-Discord-Reporter'
            })
            .addFields(
                { name: 'Duration :clock4:', value: duration, inline: true },
                { name: 'Suites :card_box:', value: suitesCount.toString(), inline: true },
                { name: 'Tests :bookmark_tabs:', value: testCount.toString(), inline: true },
            )
            .addFields(
                { name: 'Passes :white_check_mark:', value: testPassesCount.toString(), inline: true },
                { name: 'Pending :hourglass_flowing_sand:', value: testPendingCount.toString(), inline: true },
                { name: 'Failures :x:', value: testFailuresCount.toString(), inline: true },
            )
            .setThumbnail('attachment://chart.png')
            .setTimestamp();

        if (testFailuresCount > 0) {
            embed.setColor("Red");
        } else {
            embed.setColor("Green");
        }

        const testResults = extractTestResults(resultData);

        for (const { suiteTitle, test } of testResults) {
            embed.addFields(
                { name: `**${suiteTitle}**`, value: test }
            );
        }

        const form = new FormData();
        form.append('payload_json', JSON.stringify({ embeds: [embed] }));

        for (let index = 0; index < attachFiles.length; index++) {
            const fileStream = fs.createReadStream(attachFiles[index]);
            form.append(`file${index}`, fileStream);
        }

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
    } finally {
        // SVG dosyasını silme

        fs.unlink('./chart.png', (err) => {
            if (err) {
                console.error('Error deleting png file:', err);
            } else {
                console.log('SVG file deleted.');
            }
        });
    }
}

module.exports = sendDiscordWebhook;
