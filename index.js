const { createEventAdapter } = require("@slack/events-api");
const dotenv = require("dotenv");
const timeIn = require("./timein");
const timeOut = require("./timeout");

dotenv.config();

// Read the signing secret from the environment variables
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;

// Initialize
const slackEvents = createEventAdapter(slackSigningSecret);

const port = process.env.PORT || 3000;

// Attach listeners to events by Slack Event "type". See: https://api.slack.com/events/message.im
slackEvents.on("message", async event => {
  console.log(
    `Received a message event: user ${event.user} in channel ${event.channel} says ${event.text}`
  );
  if (event.text.includes(" timein")) {
    await timeIn();
  } else if (event.text.includes(" timeout")) {
    await timeOut();
  } else {
    console.log("help");
  }
});

// All errors in listeners are caught here. If this weren't caught, the program would terminate.
slackEvents.on("error", error => {
  console.log("test", error.name); // TypeError
});

(async () => {
  const server = await slackEvents.start(port);
  console.log(`Listening for events on ${server.address().port}`);
})();
