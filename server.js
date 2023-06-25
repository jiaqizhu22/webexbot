//Webex Bot Starter - featuring the webex-node-bot-framework - https://www.npmjs.com/package/webex-node-bot-framework
// require('dotenv').config({path: '/.env'});
// var framework = require("webex-node-bot-framework");
// var webhook = require("webex-node-bot-framework/webhook");
// var express = require("express");
// var bodyParser = require("body-parser");
// var app = express();
// app.use(bodyParser.json());
// app.use(express.static("images"));
// const config = {
//   webhookUrl: 'https://b5d7-60-240-54-229.ngrok-free.app',
//   token: 'OWUwMjkyMWEtMWVmYy00MWJiLTlkMzYtOGUzNmM3NzliNmYyNDdiODQ4ZjctYTIz_PF84_1eb65fdf-9643-417f-9974-ad72cae0e10f',
//   port: 7001,
// };

// // init framework
// var framework = new framework(config);
// framework.start();

// Websocket version
var Framework = require('webex-node-bot-framework');

// No express server needed when running in websocket mode

// framework options
var config = {
  // No webhookUrl, webhookSecret, or port needed
  token: 'OWUwMjkyMWEtMWVmYy00MWJiLTlkMzYtOGUzNmM3NzliNmYyNDdiODQ4ZjctYTIz_PF84_1eb65fdf-9643-417f-9974-ad72cae0e10f'
};

// init framework
var framework = new Framework(config);
framework.start();
framework.on("initialized", () => {
  framework.debug("framework is all fired up! [Press CTRL-C to quit]");
});

// A spawn event is generated when the framework finds a space with your bot in it
// If actorId is set, it means that user has just added your bot to a new space
// If not, the framework has discovered your bot in an existing space
framework.on("spawn", (bot, id, actorId) => {
  if (!actorId) {
    // don't say anything here or your bot's spaces will get
    // spammed every time your server is restarted
    console.log(
      `While starting up, the framework found our bot in a space called: ${bot.room.title}`
    );
    //bot.exit();
    // console.log(
    //   `Bot has exit ${bot.room.title}`
    // );
  } else {
    // When actorId is present it means someone added your bot got added to a new space
    // Lets find out more about them..
    var msg =
      "You can say `help` to get the list of words I am able to respond to.";
    bot.webex.people
      .get(actorId)
      .then((user) => {
        msg = `Hello there ${user.displayName}. ${msg}`;
      })
      .catch((e) => {
        console.error(
          `Failed to lookup user details in framwork.on("spawn"): ${e.message}`
        );
        msg = `Hello there. ${msg}`;
      })
      .finally(() => {
        // Say hello, and tell users what you do!
        if (bot.isDirect) {
          bot.say("markdown", msg);
        } else {
          let botName = bot.person.displayName;
          msg += `\n\nDon't forget, in order for me to see your messages in this group space, be sure to *@mention* ${botName}.`;
          bot.say("markdown", msg);
        }
      });
  }
});

// Implementing a framework.on('log') handler allows you to capture
// events emitted from the framework.  Its a handy way to better understand
// what the framework is doing when first getting started, and a great
// way to troubleshoot issues.
// You may wish to disable this for production apps
framework.on("log", (msg) => {
  console.log(msg);
});

// Process incoming messages
// Each hears() call includes the phrase to match, and the function to call if webex mesages
// to the bot match that phrase.
// An optional 3rd parameter can be a help string used by the frameworks.showHelp message.
// An optional fourth (or 3rd param if no help message is supplied) is an integer that
// specifies priority.   If multiple handlers match they will all be called unless the priority
// was specified, in which case, only the handler(s) with the lowest priority will be called

/* On mention with command
ex User enters @botname framework, the bot will write back in markdown
*/
framework.hears(
  "framework",
  (bot) => {
    console.log("framework command received");
    bot.say(
      "markdown",
      "The primary purpose for the [webex-node-bot-framework](https://github.com/jpjpjp/webex-node-bot-framework) was to create a framework based on the [webex-jssdk](https://webex.github.io/webex-js-sdk) which continues to be supported as new features and functionality are added to Webex. This version of the project was designed with two themes in mind: \n\n\n * Mimimize Webex API Calls. The original flint could be quite slow as it attempted to provide bot developers rich details about the space, membership, message and message author. This version eliminates some of that data in the interests of efficiency, (but provides convenience methods to enable bot developers to get this information if it is required)\n * Leverage native Webex data types. The original flint would copy details from the webex objects such as message and person into various flint objects. This version simply attaches the native Webex objects. This increases the framework's efficiency and makes it future proof as new attributes are added to the various webex DTOs "
    );
  },
  "**framework**: learn more about the Webex Bot Framework",
  0
);

// say hello
framework.hears('hello', (bot, trigger) => {
  bot.say('Hello %s!', trigger.person.displayName);
}, '**hello** - say hello and I\'ll say hello back'); // zero is default priorty

// echo user input
framework.hears('echo', (bot, trigger) => {
  let phrase = trigger.args.slice(1).join(' ');
  bot.say('markdown', `You said: ${phrase}`);
}, '**echo** - I\'ll echo back the rest of your message');

/* On mention with command, using other trigger data, can use lite markdown formatting
ex User enters @botname 'info' phrase, the bot will provide personal details
*/
framework.hears(
  "info",
  (bot, trigger) => {
    console.log("info command received");
    //the "trigger" parameter gives you access to data about the user who entered the command
    let personAvatar = trigger.person.avatar;
    let personEmail = trigger.person.emails[0];
    let personDisplayName = trigger.person.displayName;
    let outputString = `Here is your personal information: \n\n\n **Name:** ${personDisplayName}  \n\n\n **Email:** ${personEmail} \n\n\n **Avatar URL:** ${personAvatar}`;
    bot.say("markdown", outputString);
  },
  "**info**: get your personal details",
  0
);

/* On mention with bot data 
ex User enters @botname 'space' phrase, the bot will provide details about that particular space
*/
framework.hears(
  "space",
  (bot) => {
    console.log("space. the final frontier");
    let roomTitle = bot.room.title;
    let spaceID = bot.room.id;
    let roomType = bot.room.type;

    let outputString = `The title of this space: ${roomTitle} \n\n The roomID of this space: ${spaceID} \n\n The type of this space: ${roomType}`;

    console.log(outputString);
    bot
      .say("markdown", outputString)
      .catch((e) => console.error(`bot.say failed: ${e.message}`));
  },
  "**space**: get details about this space",
  0
);

/* 
   Say hi to every member in the space
   This demonstrates how developers can access the webex
   sdk to call any Webex API.  API Doc: https://webex.github.io/webex-js-sdk/api/
*/
framework.hears(
  "say hi to everyone",
  (bot) => {
    console.log("say hi to everyone.  Its a party");
    // Use the webex SDK to get the list of users in this space
    bot.webex.memberships
      .list({ roomId: bot.room.id })
      .then((memberships) => {
        for (const member of memberships.items) {
          if (member.personId === bot.person.id) {
            // Skip myself!
            continue;
          }
          let displayName = member.personDisplayName
            ? member.personDisplayName
            : member.personEmail;
          bot.say(`Hello ${displayName}`);
        }
      })
      .catch((e) => {
        console.error(`Call to sdk.memberships.get() failed: ${e.messages}`);
        bot.say("Hello everybody!");
      });
  },
  "**say hi to everyone**: everyone gets a greeting using a call to the Webex SDK",
  0
);

// Buttons & Cards data
let cardJSON = {
  $schema: "http://adaptivecards.io/schemas/adaptive-card.json",
  type: "AdaptiveCard",
  version: "1.0",
  body: [
    {
      type: "ColumnSet",
      columns: [
        {
          type: "Column",
          width: "5",
          items: [
            {
              type: "Image",
              url: "Your avatar appears here!",
              size: "large",
              horizontalAlignment: "Center",
              style: "person",
            },
            {
              type: "TextBlock",
              text: "Your name will be here!",
              size: "medium",
              horizontalAlignment: "Center",
              weight: "Bolder",
            },
            {
              type: "TextBlock",
              text: "And your email goes here!",
              size: "small",
              horizontalAlignment: "Center",
              isSubtle: true,
              wrap: false,
            },
          ],
        },
      ],
    },
  ],
};

/* On mention with card example
ex User enters @botname 'card me' phrase, the bot will produce a personalized card - https://developer.webex.com/docs/api/guides/cards
*/
framework.hears(
  "card me",
  (bot, trigger) => {
    console.log("someone asked for a card");
    let avatar = trigger.person.avatar;

    cardJSON.body[0].columns[0].items[0].url = avatar
      ? avatar
      : `${config.webhookUrl}/missing-avatar.jpg`;
    cardJSON.body[0].columns[0].items[1].text = trigger.person.displayName;
    cardJSON.body[0].columns[0].items[2].text = trigger.person.emails[0];
    bot.sendCard(
      cardJSON,
      "This is customizable fallback text for clients that do not support buttons & cards"
    );
  },
  "**card me**: a cool card!",
  0
);

/* On mention reply example
ex User enters @botname 'reply' phrase, the bot will post a threaded reply
*/
framework.hears(
  "reply",
  (bot, trigger) => {
    console.log("someone asked for a reply.  We will give them two.");
    bot.reply(
      trigger.message,
      "This is threaded reply sent using the `bot.reply()` method.",
      "markdown"
    );
    var msg_attach = {
      text: "This is also threaded reply with an attachment sent via bot.reply(): ",
      file: "https://media2.giphy.com/media/dTJd5ygpxkzWo/giphy-downsized-medium.gif",
    };
    bot.reply(trigger.message, msg_attach);
  },
  "**reply**: have bot reply to your message",
  0
);

/* On mention with command
ex User enters @botname help, the bot will write back in markdown
 *
 * The framework.showHelp method will use the help phrases supplied with the previous
 * framework.hears() commands
*/
framework.hears(
  /help|what can i (do|say)|what (can|do) you do/i,
  (bot, trigger) => {
    console.log(`someone needs help! They asked ${trigger.text}`);
    bot
      .say(`Hello ${trigger.person.displayName}.`)
      //    .then(() => sendHelp(bot))
      .then(() => bot.say("markdown", framework.showHelp()))
      .catch((e) => console.error(`Problem in help hander: ${e.message}`));
  },
  "**help**: what you are reading now",
  0
);

// DM functions
framework.hears('dm me', (bot, trigger) => {
  let message = "**Hello**";
  if (trigger.args[0] === "Merakii" && trigger.args.slice(3).join(' ') !== "") {
    message = "From yourself: " + trigger.args.slice(3).join(' ');
  } else if (trigger.args.slice(3).join(' ') !== "") {
    message = "From yourself: " + trigger.args.slice(2).join(' ');
  }
  // console.log(`I'm gonna send myself a message ${message}`);
  bot.dm(trigger.person.id, 'markdown', message);
}, '**dm me [optinal message]** - ask the bot to send a message to you in a 1-1 space');

// Markdown Method 2 - Define message format as part of argument string
framework.hears('dm someone', (bot, trigger) => {
  let message = "**Hello**";
  let someone = trigger.args[3];
  if (trigger.args[0] === "Merakii" && trigger.args.slice(4).join(' ') !== "") {
    message = "From " + bot.room.title + ": " + trigger.args.slice(4).join(' ');
  } else if (trigger.args.slice(3).join(' ') !== "") {
    someone = trigger.args[2];
    message = "From " + bot.room.title + ": " + trigger.args.slice(3).join(' ');
  }
  // console.log(`I'm gonna send ${someone} a message ${message}`);
  bot.dm(someone, 'markdown', message);
}, '**dm someone [webex ID] [optional message]** - ask the bot to send a message to someone with [webex ID] in a 1-1 space; if no message is supplied, the bot will send a hello message');

framework.hears(
  /kb/, 
  (bot, trigger) => {
  if ((trigger.args[0] === "Merakii" && trigger.args.slice(2).join('+') === "") || trigger.args.slice(1).join('+') === "" ) {
    bot.say("Query is empty. Please try again.");
  } else {
    let arg_trim = trigger.args;
    if (trigger.args[0] === "Merakii") {
      arg_trim = arg_trim.slice(2);
    } else {
      arg_trim = arg_trim.slice(1);
    }
    let queries = arg_trim.join('+');
    let url = "https://documentation.meraki.com/Special:Search?qid=&fpid=230&fpth=&query="+queries+"&type=wiki";
    bot.say(`Here you go: ${url}`);
  }
}, '**kb [queries]** - ask the bot to search in documentation');

framework.hears(
  /tshoot/, 
  (bot, trigger) => {
  if ((trigger.args[0] === "Merakii" && trigger.args.slice(2).join('+') === "") || trigger.args.slice(1).join('+') === "" ) {
    let base_url = "https://docs.google.com/spreadsheets/d/1QCAEwIiz6eoMAU2FBuIknWYb6yYngmkD/edit#gid=1347589368";
    bot.say(`Here you go: ${base_url}`);
  } else {
    let arg_trim = trigger.args;
    if (trigger.args[0] === "Merakii") {
      arg_trim = arg_trim.slice(2);
    } else {
      arg_trim = arg_trim.slice(1);
    }
    let queries = arg_trim.join(' ').toLowerCase();
    let url = "https://docs.google.com/spreadsheets/d/1QCAEwIiz6eoMAU2FBuIknWYb6yYngmkD/edit#gid=";
    let gid = "1347589368";
    switch (queries) {
      case "mx":
      case "security appliance":
      case "firewall":
        gid = "651024759";
      case "ms":
      case "sw":
      case "switch":
        gid = "14412788";
      case "mr":
      case "ap":
      case "access point":
        gid = "222414308";
      case "mg":
        gid = "638083231";
      case "mv":
      case "camera":
        gid = "869427069";
      case "multi":
      case "multi-device":
      case "device":
        gid = "579224543";
      case "nfo":
        gid = "592910562";
      case "eco":
        gid = "1149933802";
      case "custom queires":
      case "queries":
      case "sql":
        gid = "374889387";
      case "tcpdump":
        gid = "1434504654";
      case "wireshark":
        gid = "1133638410";
      case "partial postgres schema": 
      case "postgres":
      case "schema":
        gid = "1363926181";
      case "special url":
      case "urls":
      case "url":
        gid = "1796417142";
    }
    url += gid;
    bot.say(`Here you go: ${url}`);
  }
}, '**tshoot [model | queries]** - ask the bot to send you tshoot commands');


/* On mention with unexpected bot command
   Its a good practice is to gracefully handle unexpected input
   Setting the priority to a higher number here ensures that other 
   handlers with lower priority will be called instead if there is another match
*/
framework.hears(
  /.*/,
  (bot, trigger) => {
    // This will fire for any input so only respond if we haven't already
    console.log(`catch-all handler fired for user input: ${trigger.text}`);
    bot
      .say(`Sorry, I don't know how to respond to "${trigger.text}"`)
      .then(() => bot.say("markdown", framework.showHelp()))
      //    .then(() => sendHelp(bot))
      .catch((e) =>
        console.error(`Problem in the unexepected command hander: ${e.message}`)
      );
  },
  99999
);

//Server config & housekeeping
// Health Check
// app.get("/", (req, res) => {
//   res.send(`I'm alive.`);
// });

// app.post("/", webhook(framework));

// var server = app.listen(config.port, () => {
//   framework.debug("framework listening on port %s", config.port);
// });

// gracefully shutdown (ctrl-c)
process.on("SIGINT", () => {
  framework.debug("stopping...");
  //server.close();
  framework.stop().then(() => {
    process.exit();
  });
});
