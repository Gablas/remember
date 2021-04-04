require("dotenv").config();
const db = require("./db/database");
require('heroku-self-ping').default("https://remember-discord.herokuapp.com/");

var http = require("http");
http.createServer(function (req, res) {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write("Hello World!");
    res.end();
}).listen(process.env.PORT);

const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
    console.log("I am ready!");
});

const filter = (m, id) => m.author.id === id;

function formatCheck(message, length) {
    let split = message.split(" ");

    if (split.length != length) {
        return false;
    }
    return true;
}

async function add(message) {
    let split = message.content.split(" ");
    if (split.length != 2) {
        message.channel.send(
            "The format should be '?add [keyword]', try again :)"
        );
        return;
    }

    let keyword = message.content.split(" ")[1];
    let text = null;

    if (!db.IsFree(keyword)) {
        message.channel.send("Keyword is in use!");
        return;
    }

    message.channel.send("Nice keyword");
    message.channel.send("What should be saved to the keyword?");

    let res = null;
    try {
        res = await message.channel.awaitMessages(
            (m) => filter(m, message.author.id),
            {
                max: 1,
                time: 60000,
                errors: ["time"],
            }
        );
    } catch (e) {
        message.channel.send("You're so slow, START OVER!");
    }

    text = res.first().content;
    message.channel.send("Keyword: " + keyword);
    message.channel.send("Text: " + text);
    message.channel.send("Correct? y/N");

    try {
        res = await message.channel.awaitMessages(
            (m) => filter(m, message.author.id),
            {
                max: 1,
                time: 60000,
                errors: ["time"],
            }
        );
    } catch (e) {
        message.channel.send("You're so slow, START OVER!");
    }

    if (res.first().content.toLowerCase() == "y") {
        if (!db.Add(keyword, text)) {
            message.channel.send("Something went wrong!");
        } else {
            message.channel.send("Saved in my pouch!");
        }
    } else {
        message.channel.send("Lost potential, that was some good text. :(");
    }
}

client.on("message", (message) => {
    if (message.content.startsWith("?add")) {
        add(message);
    } else if (message.content.startsWith("?remove")) {
        let split = message.content.split(" ");
        if (split.length != 2) {
            message.channel.send(
                "The format should be '?remove [keyword]', try again :)"
            );
            return;
        }
        db.Remove(split[1]);
    } else if (message.content.startsWith("?")) {
        if (!formatCheck(message.content, 1)) {
            message.channel.send(
                "The format should be '?[keyword]', try again :)"
            );
            return;
        }

        const keyword = message.content.replace("?", "");
        const res = db.GetText(keyword);
        if (res) {
            message.channel.send(res);
        } else {
            message.channel.send("Keyword doesn't exist beep boop!");
        }
    }
});

client.login(process.env.TOKEN);
