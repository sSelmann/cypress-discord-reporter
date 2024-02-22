# cypress-discord-reporter.
<img align="right" src="https://imgur.com/sDZSmDC.png" alt="Mochawesome Report" width="46%" />
This package sends Mochawesome test results to Discord channel via Discord Webhook.
<br />
<br />
<a href="https://www.npmjs.com/package/@sselmann/cypress-discord-reporter"><img src="https://static.npmjs.com/b0f1a8318363185cc2ea6a40ac23eeb2.png"></a> <a href="https://github.com/sSelmann/Cypress-Discord-Reporter"><img src="https://github.githubassets.com/favicons/favicon.png" style="background: white"></a>

## Install

    npm install @sselmann/cypress-discord-reporter

## Pre-requisite
[mochawesome](https://www.npmjs.com/package/mochawesome)

[Create a Discord Webhook and copy Webhook URL](https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks#:~:text=%C2%A0%20Facebook-,Making%20A%20Webhook,-With%20that%20in)
## Setup

1- Import reporter to cypress.config.js\config.ts file.
```js
const sendDiscordWebhook = require('@sselmann/cypress-discord-reporter');
```    
or for typescript:
```js
import sendDiscordWebhook from "@sselmann/cypress-discord-reporter";
```
    
2- Declare `reportDir` and `reportFileName`
```js
const  reportDir  =  'cypress/results/';
const  reportFileName  =  'mochawesome';
```
3- set reporter and options with use `defineConfig`
```js
module.exports = defineConfig({
    reporter: 'mochawesome',
    reporterOptions: {
        reportDir: reportDir,
        overwrite: true,
        html: false,
        json: true,
    },
});
```
4- use `after:run` in `setupNodeEvents` and specify the webhook url and title. 
```js
setupNodeEvents(on, config) {
    on('after:run', async () => {
        const webhookURL = '<webhookURL>'; // Webhook URL for Discord
        const resultFile = reportDir + reportFileName + '.json';
        const title = 'Example Test Results'; // Title for results
        await sendDiscordWebhook(
            webhookURL,
            resultFile,
            title,
        );
    });
    return config;
},
```
##
Here is an example of a config file with all codes to be added:
```js
const {defineConfig} = require('cypress');
const sendDiscordWebhook = require('@sselmann/cypress-discord-reporter');

const reportDir = 'cypress/results/';
const reportFileName = 'mochawesome';

module.exports = defineConfig({
    reporter: 'mochawesome',
    reporterOptions: {
        reportDir: reportDir,
        overwrite: true,
        html: false,
        json: true,
    },
    e2e: {
        setupNodeEvents(on, config) {
            on('after:run', async () => {
                const webhookURL = '<webhookURL>'; // Webhook URL for Discord
                const resultFile = reportDir + reportFileName + '.json';
                const title = 'Example Test Results'; // Title for results

                await sendDiscordWebhook(
                    webhookURL,
                    resultFile,
                    title,
                );
            });
            return config;
        },
    },
});
```

## Execution
just run cypress

    npx cypress run --spec <enter_your_spec>
or 

    npx cypress run

After the test process is finished, the report will appear on the discord channel.
