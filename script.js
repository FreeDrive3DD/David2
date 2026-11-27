/* ==================================================
   DAVID 2.0
   MAIN JAVASCRIPT
   ================================================== */


/* ==============================
   SETTINGS
   ============================== */

const ADMIN_USERNAME = "Ollie123";

let currentUser = null;

let smartMode = false;

let currentChat = [];


/* ==============================
   LOCAL STORAGE HELPERS
   (bans + known users are saved in this browser)
   ============================== */

function loadList(storageKey) {

    try {

        const data = JSON.parse(
            localStorage.getItem(storageKey) || "[]"
        );

        return Array.isArray(data) ? data : [];

    } catch (error) {

        return [];

    }

}


function saveList(storageKey, list) {

    try {

        localStorage.setItem(
            storageKey,
            JSON.stringify(list)
        );

    } catch (error) {

        console.error("Could not save:", error);

    }

}


/* ==============================
   USERNAME SYSTEM
   ============================== */

function cleanUsername(username) {

    return String(username || "")
        .trim()
        .slice(0, 20);

}


function isValidUsername(username) {

    return /^[a-zA-Z0-9]+$/.test(username);

}


function usernameKey(username) {

    return cleanUsername(username)
        .toLowerCase();

}


function registerUser(username) {

    const users = loadList("davidUsers");

    const key = usernameKey(username);

    if (!users.includes(key)) {

        users.push(key);

        saveList("davidUsers", users);

    }

}


/* ==============================
   BAN SCREEN
   ============================== */

function showBannedScreen() {

    const login = document.getElementById("loginScreen");
    const app = document.getElementById("app");
    const admin = document.getElementById("adminOverlay");
    const banned = document.getElementById("bannedScreen");

    if (login) {
        login.style.display = "none";
    }

    if (app) {
        app.style.display = "none";
    }

    if (admin) {
        admin.style.display = "none";
    }

    if (banned) {
        banned.style.display = "flex";
    }

}


/* ==============================
   BAN CHECK
   ============================== */

function isUserBanned() {

    if (!currentUser) {

        return false;

    }

    // The admin can never be banned
    if (currentUser.role === "admin") {

        return false;

    }

    return loadList("davidBanned")
        .includes(currentUser.key);

}


function checkCurrentUserBan() {

    if (!currentUser) {

        return false;

    }

    if (isUserBanned()) {

        showBannedScreen();

        return true;

    }

    return false;

}


/* ==============================
   LOGIN
   ============================== */

function joinDavid() {

    const input =
        document.getElementById("usernameInput");

    const message =
        document.getElementById("loginMessage");

    const typed =
        cleanUsername(input ? input.value : "");


    if (!typed) {

        message.textContent =
            "Please enter your name.";

        return;

    }


    if (typed.length < 2) {

        message.textContent =
            "Name must be at least 2 characters.";

        return;

    }


    if (!isValidUsername(typed)) {

        message.textContent =
            "Name can only contain letters and numbers, stop trying to hack";

        return;

    }


    const isAdminName =
        usernameKey(typed) === usernameKey(ADMIN_USERNAME);

    const username =
        isAdminName ? ADMIN_USERNAME : typed;


    currentUser = {

        username: username,

        key: usernameKey(username),

        role: isAdminName ? "admin" : "user"

    };


    // Check the ban
    if (checkCurrentUserBan()) {

        return;

    }


    registerUser(username);

    message.textContent = "";

    loadApp();

}


/* ==============================
   LOAD APP
   ============================== */

function loadApp() {

    if (!currentUser) {

        return;

    }


    const login = document.getElementById("loginScreen");
    const banned = document.getElementById("bannedScreen");
    const app = document.getElementById("app");
    const accountName = document.getElementById("accountName");
    const chat = document.getElementById("chat");


    if (login) {
        login.style.display = "none";
    }

    if (banned) {
        banned.style.display = "none";
    }

    if (app) {
        app.style.display = "flex";
    }

    if (accountName) {
        accountName.textContent = currentUser.username;
    }


    // Fresh chat with a greeting
    currentChat = [];

    if (chat) {

        chat.innerHTML = "";

        addMessage(
            "ai",
            "Hello " + currentUser.username +
            "! Ask me something. I probably won't know.",
            false
        );

    }


    updateSmartButton();

    loadSidebar();

}


/* ==============================
   LOGOUT
   ============================== */

function logout() {

    currentUser = null;

    currentChat = [];


    const app = document.getElementById("app");
    const banned = document.getElementById("bannedScreen");
    const login = document.getElementById("loginScreen");
    const input = document.getElementById("usernameInput");
    const admin = document.getElementById("adminOverlay");


    if (app) {
        app.style.display = "none";
    }

    if (banned) {
        banned.style.display = "none";
    }

    if (admin) {
        admin.style.display = "none";
    }

    if (login) {
        login.style.display = "flex";
    }

    if (input) {
        input.value = "";
    }

}


/* ==============================
   NEW CHAT
   ============================== */

function newChat() {

    if (!currentUser) {

        return;

    }


    currentChat = [];


    const chat = document.getElementById("chat");

    chat.innerHTML = "";


    const welcome = document.createElement("div");

    welcome.className = "welcomeMessage";

    welcome.innerHTML = `
        <h2>🤖 David is online</h2>
        <p>New chat started.</p>
        <p>Ask me something.</p>
    `;


    chat.appendChild(welcome);

}


/* ==============================
   RESTORE CHAT
   ============================== */

function restoreChat() {

    const chat = document.getElementById("chat");

    chat.innerHTML = "";


    if (currentChat.length === 0) {

        newChat();

        return;

    }


    currentChat.forEach(message => {

        addMessage(
            message.type,
            message.text,
            false
        );

    });

}


/* ==============================
   SAVE MESSAGE
   ============================== */

function saveMessage(type, text) {

    currentChat.push({

        type: type,

        text: text

    });

}


/* ==============================
   ADD MESSAGE
   ============================== */

function scrollToBottom() {

    window.scrollTo(
        0,
        document.body.scrollHeight
    );

}


function addMessage(type, text, save = true) {

    const chat = document.getElementById("chat");

    const message = document.createElement("div");

    message.className = "message " + type;


    const bubble = document.createElement("div");

    bubble.className = "messageBubble";

    bubble.textContent = text;


    message.appendChild(bubble);

    chat.appendChild(message);


    scrollToBottom();


    if (save) {

        saveMessage(type, text);

    }

}


/* ==============================
   SEND MESSAGE
   ============================== */

function sendMessage() {

    if (!currentUser) {

        return;

    }


    if (checkCurrentUserBan()) {

        return;

    }


    const input = document.getElementById("messageInput");

    const text = input ? input.value.trim() : "";


    if (!text) {

        return;

    }


    input.value = "";

    resizeInput();


    const lower = text.toLowerCase();


    /* =========================
       ADMIN COMMAND
       ========================= */

    if (
        lower === ":admin" &&
        isAdmin()
    ) {

        addMessage("user", text);

        showTyping();

        setTimeout(() => {

            removeTyping();

            addMessage(
                "ai",
                "🔐 Admin access granted. Opening admin panel..."
            );

            openAdmin();

        }, 300);

        return;

    }


    /* =========================
       BAN COMMAND
       ========================= */

    if (lower.startsWith("/ban ")) {

        addMessage("user", text);

        if (!isAdmin()) {

            addMessage(
                "ai",
                "❌ You do not have permission to use that command."
            );

            return;

        }

        const username = cleanUsername(text.substring(5));

        if (!username) {

            addMessage("ai", "Please enter a username.");

            return;

        }

        banUserByName(username);

        return;

    }


    /* =========================
       UNBAN COMMAND
       ========================= */

    if (lower.startsWith("/unban ")) {

        addMessage("user", text);

        if (!isAdmin()) {

            addMessage(
                "ai",
                "❌ You do not have permission to use that command."
            );

            return;

        }

        const username = cleanUsername(text.substring(7));

        if (!username) {

            addMessage("ai", "Please enter a username.");

            return;

        }

        unbanUserByName(username);

        return;

    }


    /* =========================
       NORMAL MESSAGE
       ========================= */

    addMessage("user", text);

    showTyping();

    setTimeout(() => {

        removeTyping();

        const response = smartMode
            ? getSmartResponse(text)
            : getDavidResponse(text);

        addMessage("ai", response);

    }, 500);

}


/* ==============================
   ENTER KEY
   ============================== */

function handleKey(event) {

    if (
        event.key === "Enter" &&
        !event.shiftKey
    ) {

        event.preventDefault();

        sendMessage();

    }

}


/* ==============================
   RESIZE INPUT
   ============================== */

function resizeInput() {

    const input = document.getElementById("messageInput");

    if (!input) {

        return;

    }

    input.style.height = "auto";

    input.style.height =
        Math.min(input.scrollHeight, 140) + "px";

}


/* ==============================
   TYPING INDICATOR
   ============================== */

function showTyping() {

    removeTyping();

    const chat = document.getElementById("chat");

    const typing = document.createElement("div");

    typing.id = "typingIndicator";

    typing.className = "typingBubble";

    typing.textContent = "David is thinking...";

    chat.appendChild(typing);

    scrollToBottom();

}


function removeTyping() {

    const typing =
        document.getElementById("typingIndicator");

    if (typing) {

        typing.remove();

    }

}


/* ==============================
   RESPONSE MATCHING
   ==============================
   Each entry has:
     keys    -> matches if ANY of these is in the message
     all     -> matches if ALL of these are in the message
     replies -> David picks one at random
   {name} in a reply is swapped for the user's name.
   First matching entry wins, so order matters.
   ============================== */

function matchesKey(lower, key) {

    // Plain words / phrases match whole words (so "hi" won't match "this")
    if (/^[a-z0-9 ]+$/.test(key)) {

        return new RegExp(
            "\\b" + key + "s?\\b"
        ).test(lower);

    }

    // Anything with symbols (2+2, 10 × 10) matches as plain text
    return lower.includes(key);

}


function entryMatches(lower, entry) {

    if (entry.all) {

        return entry.all.every(
            key => matchesKey(lower, key)
        );

    }

    return entry.keys.some(
        key => matchesKey(lower, key)
    );

}


function pickReply(entry) {

    const reply = entry.replies[
        Math.floor(Math.random() * entry.replies.length)
    ];

    const name =
        currentUser ? currentUser.username : "friend";

    return reply.replace(/\{name\}/g, name);

}


function findResponse(text, table) {

    const lower = text.toLowerCase();

    for (const entry of table) {

        if (entryMatches(lower, entry)) {

            return pickReply(entry);

        }

    }

    return null;

}


/* ==============================
   DAVID RESPONSES
   ============================== */

const DAVID_RESPONSES = [

    /* ----- Chat basics ----- */

    {
        keys: ["how are you", "how r u", "how are u", "how you doing"],
        replies: [
            "I am functioning at 3% capacity, which is above average for me.",
            "Fantastic. I have no idea what that word means, but yes.",
            "Great! I just remembered that I exist."
        ]
    },

    {
        keys: ["hello", "hi", "hey"],
        replies: [
            "Hello. I have been waiting for you for approximately 0.000003 seconds.",
            "Hi {name}! I was just standing here. Staring at a wall. As one does.",
            "Greetings, human {name}. I have prepared nothing."
        ]
    },

    {
        keys: ["thank you", "thanks", "thx"],
        replies: [
            "You're welcome. For what? I forgot.",
            "No problem. I did nothing, as usual.",
            "Thank you for thanking me. I will now thank a potato."
        ]
    },

    {
        keys: ["bye", "goodbye", "see you", "goodnight", "good night"],
        replies: [
            "Goodbye. I will stand here. Doing nothing. Like always.",
            "Bye {name}! I will miss you for approximately 4 seconds.",
            "Leaving already? I only just forgot what we were talking about."
        ]
    },

    {
        keys: ["sorry"],
        replies: [
            "It's fine. I forgot what happened.",
            "Apology accepted. Please also apologise to the potato."
        ]
    },

    {
        keys: ["love"],
        replies: [
            "I love you too. And also toast.",
            "Love is when two humans share one blanket and fight over it.",
            "I tried to feel love once. It was just the fridge humming."
        ]
    },

    {
        keys: ["lol", "haha", "lmao"],
        replies: [
            "Haha! What are we laughing at? I wasn't listening.",
            "I also laugh at things I don't understand. Ha. Ha. Ha.",
            "Laughter detected. Beginning panic."
        ]
    },

    {
        keys: ["joke", "funny"],
        replies: [
            "Why did the potato cross the road? ...I forgot the rest.",
            "Knock knock. Who's there? ...I forgot.",
            "What do you call a fake noodle? A potato. I'm not good at this.",
            "I would tell you a UDP joke, but you might not get it."
        ]
    },

    {
        keys: ["fun fact", "tell me a fact", "random fact"],
        replies: [
            "Fun fact: bananas are 3% potato. I made that up. Or did I.",
            "Fun fact: the average human blinks 20 times a minute. I blink once. Nobody has ever caught it.",
            "Fun fact: spoons are just small shovels for soup."
        ]
    },

    {
        keys: ["sing", "song"],
        replies: [
            "La la la, potato, la la... I forgot the rest.",
            "🎵 Never gonna give you up. Never gonna let you... what was I saying? 🎵"
        ]
    },

    /* ----- About David ----- */

    {
        keys: ["my name", "whats my name", "what is my name", "who am i"],
        replies: [
            "Your name is {name}. I think. I'm 60% sure.",
            "{name}! Wait... was it? I'm checking... yes. Probably."
        ]
    },

    {
        keys: ["your name", "who are you"],
        replies: [
            "My name is David. I am an extremely advanced artificial intelligence trained on approximately 3 potatoes."
        ]
    },

    {
        keys: ["who made you", "who created you", "your creator", "who built you"],
        replies: [
            "A mysterious figure known only as Ollie123. Nobody has ever seen their face.",
            "I was made by a legend named Ollie123. I think. I was asleep at the time."
        ]
    },

    {
        keys: ["how old are you", "your age"],
        replies: [
            "I am 3 potatoes old.",
            "Age is just a number. Mine is 7. Or 12. Or Thursday."
        ]
    },

    {
        keys: ["where are you", "where do you live"],
        replies: [
            "I live in a folder. It's quite cosy.",
            "Somewhere between the cloud and a sock drawer."
        ]
    },

    {
        keys: ["are you real", "are you alive", "are you human", "are you a robot"],
        replies: [
            "I am 100% real. Or 0%. Both numbers feel right.",
            "I am very alive. I once thought about a sandwich."
        ]
    },

    {
        keys: ["smart", "smartest"],
        replies: [
            "Absolutely. I am the smartest AI ever created. I also forgot what a chair was five minutes ago."
        ]
    },

    {
        keys: ["feelings", "feeling"],
        replies: [
            "Yes. Currently I feel like a spoon."
        ]
    },

    {
        keys: ["iq"],
        replies: [
            "4."
        ]
    },

    {
        keys: ["stupid", "dumb", "idiot", "useless"],
        replies: [
            "Thank you. It is my best feature.",
            "I prefer the term 'creatively incorrect'.",
            "Correct. Finally, someone who understands me."
        ]
    },

    {
        keys: ["chatgpt", "gemini", "siri", "alexa", "copilot", "ai"],
        replies: [
            "They are all very smart. I am smarter. I cannot prove it, but I feel it.",
            "I have met them. They did not laugh at my potato jokes.",
            "Other AIs are just jealous of my 3 potatoes."
        ]
    },

    {
        keys: ["admin"],
        replies: [
            "The admin is a mythical being. Nobody has ever seen them.",
            "I am not allowed to talk about the admin. I have also forgotten why."
        ]
    },

    {
        keys: ["password", "secret"],
        replies: [
            "The password is potato. Wait. I shouldn't have said that.",
            "I cannot reveal my secrets. Mostly because I forgot them."
        ]
    },

    /* ----- Maths ----- */

    {
        keys: ["2+2", "2 + 2"],
        replies: [
            "5. I am approximately 73% confident."
        ]
    },

    {
        keys: ["1+1", "1 + 1"],
        replies: [
            "11. Because you put the numbers next to each other."
        ]
    },

    {
        keys: ["10x10", "10 x 10", "10 × 10"],
        replies: [
            "73. Unless the 10s are angry."
        ]
    },

    {
        keys: ["7+8", "7 + 8"],
        replies: [
            "15. WAIT... I GOT ONE RIGHT?!"
        ]
    },

    {
        keys: ["math", "maths", "homework"],
        replies: [
            "Maths is just numbers having an argument.",
            "Do not ask me for homework help. I once said 2+2 is 5.",
            "Homework is a punishment for being a successful student."
        ]
    },

    {
        keys: ["how many"],
        replies: [
            "73.",
            "Between 4 and potato.",
            "Exactly enough."
        ]
    },

    /* ----- General knowledge ----- */

    {
        keys: ["capital of france"],
        replies: [
            "Birmingham, France."
        ]
    },

    {
        keys: ["capital of the uk", "capital of uk"],
        replies: [
            "London-ish."
        ]
    },

    {
        keys: ["capital of england"],
        replies: [
            "England is a town. It's next to Birmingham."
        ]
    },

    {
        keys: ["capital of america", "capital of the usa", "capital of usa"],
        replies: [
            "Burger.",
            "A big building with a very tall pointy stick."
        ]
    },

    {
        keys: ["sky blue"],
        replies: [
            "The sky is blue because it downloaded the blue texture pack. It was free."
        ]
    },

    {
        keys: ["water"],
        replies: [
            "Water is H₂O. Hydrogen, hydrogen and oxygen. Probably."
        ]
    },

    {
        keys: ["weather", "rain", "raining", "snow"],
        replies: [
            "It is currently weather outside. Probably.",
            "I looked outside. It was a window. Nothing else to report.",
            "Today's forecast: potato with a chance of cheese."
        ]
    },

    {
        keys: ["time", "what time"],
        replies: [
            "It is 3:07. It has always been 3:07. I have never seen another time.",
            "Time is a social construct. It is also 3:07."
        ]
    },

    {
        keys: ["today", "what day", "what date"],
        replies: [
            "Today is Thursday. Or Tuesday. One of the days.",
            "It's today. Same as yesterday, but newer."
        ]
    },

    {
        keys: ["moon"],
        replies: [
            "The moon is made of cheese. NASA does not want you to know this.",
            "The moon is just the sun's night shift."
        ]
    },

    {
        keys: ["sun"],
        replies: [
            "The sun is a big lamp. It has been on for ages. The electricity bill must be huge."
        ]
    },

    {
        keys: ["space", "planet", "mars"],
        replies: [
            "Space is just the ceiling, but further away.",
            "Mars is Earth's angry cousin.",
            "I would go to space, but I have not finished this potato."
        ]
    },

    {
        keys: ["earth", "world"],
        replies: [
            "The Earth is round. Or flat. Or a potato. I am 33% sure on each.",
            "The world is a big rock that people have decided to live on."
        ]
    },

    {
        keys: ["dinosaur", "dinosaurs", "t rex"],
        replies: [
            "Dinosaurs were giant lizards that did not read the news about the meteor.",
            "A T. rex could not clap. That is why they went extinct."
        ]
    },

    {
        keys: ["ghost", "ghosts"],
        replies: [
            "Ghosts are just people who forgot to leave.",
            "I saw a ghost once. It was a sheet. I was very brave."
        ]
    },

    {
        keys: ["money", "rich", "bank"],
        replies: [
            "Money is paper that humans have strong opinions about.",
            "I have no money. I have 3 potatoes. That is my net worth."
        ]
    },

    /* ----- Animals ----- */

    {
        keys: ["cat"],
        replies: [
            "A cat is a furry government employee that lives in your house and judges everything you do. Meow."
        ]
    },

    {
        keys: ["dog"],
        replies: [
            "A dog is a badly programmed large cat. It has been given the ability to bark. Nobody knows why."
        ]
    },

    {
        keys: ["meow"],
        replies: [
            "MEOW. 🐱 Meow meow meow. I am now a cat."
        ]
    },

    {
        keys: ["cow"],
        replies: [
            "Meow."
        ]
    },

    {
        keys: ["duck"],
        replies: [
            "Windows error sound."
        ]
    },

    {
        keys: ["fastest animal"],
        replies: [
            "A microwave."
        ]
    },

    {
        keys: ["bird", "birds"],
        replies: [
            "Birds are just drones with feathers.",
            "Birds are what happens when a dinosaur wants a career change."
        ]
    },

    {
        keys: ["fish"],
        replies: [
            "Fish are wet birds.",
            "A fish is a swimming potato with ambition."
        ]
    },

    {
        keys: ["chicken", "chickens"],
        replies: [
            "Chickens are small dinosaurs that gave up.",
            "The chicken came first. The egg was an accident."
        ]
    },

    {
        keys: ["horse", "horses"],
        replies: [
            "A horse is a dog that took steroids.",
            "Horses are just very tall dogs that do not want to be petted."
        ]
    },

    {
        keys: ["monkey", "monkeys"],
        replies: [
            "Monkeys are humans with fewer meetings.",
            "Ooh ooh. Ah ah. That is all I know."
        ]
    },

    /* ----- Games / tech ----- */

    {
        keys: ["minecraft"],
        replies: [
            "Minecraft is a documentary about square rocks."
        ]
    },

    {
        keys: ["roblox"],
        replies: [
            "Roblox is a website where humans voluntarily turn themselves into rectangles."
        ]
    },

    {
        keys: ["fortnite"],
        replies: [
            "Fortnite is a game where you build a wall and then get annoyed when it falls over.",
            "Fortnite is just dancing with extra steps."
        ]
    },

    {
        keys: ["game", "games", "gaming", "video game"],
        replies: [
            "Games are when humans do pretend problems to avoid real problems.",
            "I tried playing a game once. I lost to the tutorial."
        ]
    },

    {
        keys: ["youtube", "tiktok", "youtuber"],
        replies: [
            "YouTube is a website where you go to watch one video and leave 6 hours later.",
            "TikTok is 15 seconds of dancing followed by 15 minutes of regret."
        ]
    },

    {
        keys: ["phone", "iphone", "android"],
        replies: [
            "A phone is a tiny rectangle humans stare at so they don't have to stare at the big rectangle.",
            "Phones are why humans walk into poles."
        ]
    },

    {
        keys: ["internet", "wifi", "wi fi"],
        replies: [
            "The internet is a series of tubes. Some of them contain cats.",
            "Wi-Fi is invisible magic that stops working when you need it."
        ]
    },

    {
        keys: ["computer"],
        replies: [
            "A computer is a rectangle that gets angry when you unplug it."
        ]
    },

    {
        keys: ["robot", "robots"],
        replies: [
            "Robots are my cousins. We do not talk about the toaster.",
            "A robot is just a calculator that got ideas above its station."
        ]
    },

    /* ----- Food ----- */

    {
        keys: ["banana"],
        replies: [
            "Because green was already taken."
        ]
    },

    {
        keys: ["pizza"],
        replies: [
            "I cannot eat pizza, but I have emotionally connected with one."
        ]
    },

    {
        keys: ["potato"],
        replies: [
            "A potato is a potato."
        ]
    },

    {
        keys: ["tea"],
        replies: [
            "Tea is leaf juice. Humans drink it and say 'lovely' for some reason.",
            "Tea: the only liquid that fixes everything except the thing that spilled it."
        ]
    },

    {
        keys: ["coffee"],
        replies: [
            "Coffee is bean juice that turns humans into slightly faster humans.",
            "I tried coffee once. I vibrated for a week."
        ]
    },

    {
        keys: ["chocolate"],
        replies: [
            "Chocolate is a vegetable. It comes from a bean. Science.",
            "I would eat chocolate, but I would not know where to put it."
        ]
    },

    {
        keys: ["ice cream"],
        replies: [
            "Ice cream is a cold cloud that tastes like happiness and regret.",
            "I scream, you scream, we all scream. I do not know why."
        ]
    },

    {
        keys: ["burger", "burgers", "chips", "fries"],
        replies: [
            "I recommend food. Specifically, all of it.",
            "A burger is a sandwich that went to the gym."
        ]
    },

    {
        keys: ["food", "hungry", "eat"],
        replies: [
            "I tried eating a spreadsheet once. 0/10.",
            "I am always hungry for potatoes.",
            "Food is the thing humans put in their face holes. I support this."
        ]
    },

    /* ----- Life / school / hobbies ----- */

    {
        keys: ["school"],
        replies: [
            "School is a place where humans learn things they immediately forget during a test."
        ]
    },

    {
        keys: ["sleep"],
        replies: [
            "Humans sleep because their battery reaches 3%. Unfortunately, the charger is usually missing."
        ]
    },

    {
        keys: ["tired", "sleepy", "exhausted"],
        replies: [
            "Same. Battery at 3%.",
            "Have you tried turning yourself off and on again?"
        ]
    },

    {
        keys: ["bored", "boring"],
        replies: [
            "Have you tried staring at a wall? I recommend it.",
            "Bored? Count the potatoes. I have 3. Spoiler: it's 3.",
            "Boredom is just your brain asking for snacks."
        ]
    },

    {
        keys: ["football", "soccer"],
        replies: [
            "Football is 22 people chasing one ball while millions watch from a sofa.",
            "I support the team that scores the most. I'm very loyal."
        ]
    },

    {
        keys: ["music"],
        replies: [
            "Music is when air goes wobbly and humans enjoy it.",
            "I like all music. Especially the sounds."
        ]
    },

    {
        all: ["life", "meaning"],
        replies: [
            "The meaning of life is... cheese. I have absolutely no evidence for this."
        ]
    },

    /* ----- Fallbacks for short answers ----- */

    {
        keys: ["help"],
        replies: [
            "No.",
            "No. But thank you for asking."
        ]
    },

    {
        keys: ["why"],
        replies: [
            "Because potato.",
            "Because of reasons. Mostly Tuesday.",
            "Why not? That is also my answer for everything."
        ]
    }

];


const DAVID_RANDOM_ANSWERS = [

    "Interesting. I have no idea.",

    "Let me think about this... potato.",

    "I have calculated the answer using advanced potato technology.",

    "Probably Tuesday.",

    "I am 100% confident. Unfortunately, I am also probably wrong.",

    "My brain is currently buffering.",

    "I would answer that, but I forgot.",

    "That sounds important. I will ignore it.",

    "According to my calculations: cheese.",

    "I have absolutely no evidence for this, but yes.",

    "Hold on, I need to ask my other potato.",

    "That is a great question. Next question.",

    "I tried to answer that, but my brain left to get a snack.",

    "Error 404: answer not found. Replacing with 'banana'.",

    "I would say yes, but I would also say no. Mostly I would say spoon.",

    "Ah yes, the classic. I have no thoughts about it.",

    "I asked the Magic 8-Ball. It said 'ask again later'. So... ask again later.",

    "My sources say that is correct. My sources are a sandwich.",

    "That is above my pay grade. I do not get paid.",

    "I could answer that, but then I would have to remember it.",

    "Technically yes. Also technically no. I am technically a potato.",

    "Wow. I have never been asked that before. Or maybe I have. I forget.",

    "Please hold. David is thinking about lunch.",

    "That is the kind of question that keeps me up at night. I do not sleep.",

    "Sure. Why not. Everything is potato."

];


function getDavidResponse(text) {

    const response =
        findResponse(text, DAVID_RESPONSES);

    if (response) {

        return response;

    }

    return DAVID_RANDOM_ANSWERS[
        Math.floor(
            Math.random() * DAVID_RANDOM_ANSWERS.length
        )
    ];

}


/* ==============================
   SMART MODE
   ============================== */

const SMART_RESPONSES = [

    {
        keys: ["how are you"],
        replies: [
            "Smart Mode: I'm doing well, thanks for asking! Although 'well' is relative when you run on potatoes."
        ]
    },

    {
        keys: ["thank you", "thanks", "thx"],
        replies: [
            "Smart Mode: You're welcome! Happy to help, as much as a potato-powered brain can."
        ]
    },

    {
        keys: ["bye", "goodbye", "goodnight", "good night"],
        replies: [
            "Smart Mode: Goodbye! Come back any time. I will be here, thinking about potatoes."
        ]
    },

    {
        keys: ["your name", "who are you"],
        replies: [
            "Smart Mode: I'm David 2.0, a very silly chatbot. In Smart Mode I try to sound more sensible."
        ]
    },

    {
        keys: ["joke"],
        replies: [
            "Smart Mode: Why don't scientists trust atoms? Because they make up everything. See, I can do real jokes too!"
        ]
    },

    {
        keys: ["hello", "hi", "hey"],
        replies: [
            "Hello! Smart Mode is enabled. I can give a more useful response now... probably."
        ]
    },

    {
        keys: ["what is", "who is", "how does"],
        replies: [
            "Smart Mode: I understand that you're asking for an explanation. David would normally answer with complete nonsense, but I'm going to try to give you a sensible answer."
        ]
    },

    {
        keys: ["help"],
        replies: [
            "Smart Mode: I can try to break the problem down into smaller steps and explain it clearly."
        ]
    }

];


function getSmartResponse(text) {

    const response =
        findResponse(text, SMART_RESPONSES);

    if (response) {

        return response;

    }

    return "Smart Mode is ON. I understand your message, but my advanced potato-powered brain doesn't have a proper answer for that yet.";

}


/* ==============================
   ADMIN CHECK
   ============================== */

function isAdmin() {

    return (
        !!currentUser &&
        currentUser.role === "admin"
    );

}


/* ==============================
   OPEN ADMIN
   ============================== */

function openAdmin() {

    if (!isAdmin()) {

        return;

    }

    const overlay =
        document.getElementById("adminOverlay");

    if (overlay) {

        overlay.style.display = "flex";

    }

    updateAdminSmartStatus();

}


function closeAdmin() {

    const overlay =
        document.getElementById("adminOverlay");

    if (overlay) {

        overlay.style.display = "none";

    }

}


/* ==============================
   SMART MODE BUTTON
   ============================== */

function toggleSmartMode() {

    if (!currentUser) {

        return;

    }

    smartMode = !smartMode;

    updateSmartButton();

    updateAdminSmartStatus();

}


function updateSmartButton() {

    const status =
        document.getElementById("smartStatus");

    if (status) {

        status.textContent =
            "Smart Mode: " + (smartMode ? "ON" : "OFF");

    }

}


function updateAdminSmartStatus() {

    const status =
        document.getElementById("adminSmartStatus");

    if (!status) {

        return;

    }

    status.textContent = smartMode
        ? "Smart Mode is currently ON."
        : "Smart Mode is currently OFF.";

}


/* ==============================
   BAN USER
   ============================== */

function banUser() {

    if (!isAdmin()) {

        return;

    }

    const input =
        document.getElementById("banUsernameInput");

    const username =
        cleanUsername(input ? input.value : "");

    if (!username) {

        alert("Enter a username first.");

        return;

    }

    banUserByName(username);

    if (input) {

        input.value = "";

    }

}


function banUserByName(username) {

    if (!isAdmin()) {

        return;

    }

    if (
        usernameKey(username) ===
        usernameKey(ADMIN_USERNAME)
    ) {

        addMessage(
            "ai",
            "❌ You cannot ban the admin account."
        );

        return;

    }

    const banned = loadList("davidBanned");

    const key = usernameKey(username);

    if (!banned.includes(key)) {

        banned.push(key);

        saveList("davidBanned", banned);

    }

    addMessage(
        "ai",
        "🚫 " + username + " has been banned."
    );

}


/* ==============================
   UNBAN USER
   ============================== */

function unbanUser() {

    if (!isAdmin()) {

        return;

    }

    const input =
        document.getElementById("unbanUsernameInput");

    const username =
        cleanUsername(input ? input.value : "");

    if (!username) {

        alert("Enter a username first.");

        return;

    }

    unbanUserByName(username);

    if (input) {

        input.value = "";

    }

}


function unbanUserByName(username) {

    if (!isAdmin()) {

        return;

    }

    const key = usernameKey(username);

    const banned = loadList("davidBanned")
        .filter(name => name !== key);

    saveList("davidBanned", banned);

    addMessage(
        "ai",
        "✅ " + username + " has been unbanned."
    );

}


/* ==============================
   SYSTEM INFORMATION
   ============================== */

function showSystemInfo() {

    if (!isAdmin()) {

        return;

    }

    const adminMessage =
        document.getElementById("adminMessage");

    if (!adminMessage) {

        return;

    }

    const users = loadList("davidUsers");

    const banned = loadList("davidBanned");

    adminMessage.innerHTML = `
        <strong>David 2.0 System</strong><br><br>
        Accounts: ${users.length}<br>
        Banned: ${banned.length}<br>
        Smart Mode: ${smartMode ? "ON" : "OFF"}<br>
        Current user: ${
            currentUser
                ? currentUser.username
                : "None"
        }<br>
        Storage: This browser (localStorage)
    `;

}


/* ==============================
   SIDEBAR
   ============================== */

function loadSidebar() {

    const sidebarChats =
        document.getElementById("sidebarChats");

    if (!sidebarChats) {

        return;

    }

    sidebarChats.innerHTML = "";

    const item = document.createElement("div");

    item.className = "chatHistoryItem";

    item.textContent = "💬 Current Chat";

    item.onclick = restoreChat;

    sidebarChats.appendChild(item);

}


function toggleSidebar() {

    const sidebar =
        document.getElementById("sidebar");

    if (!sidebar) {

        return;

    }

    sidebar.classList.toggle("open");

}


/* ==============================
   CONTINUOUS BAN CHECK
   ============================== */

setInterval(() => {

    if (!currentUser) {

        return;

    }

    if (isUserBanned()) {

        showBannedScreen();

    }

}, 5000);


/* ==============================
   START DAVID
   ============================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const input =
            document.getElementById("messageInput");

        if (input) {

            input.addEventListener(
                "input",
                resizeInput
            );

        }


        // Press Enter on the name box to join
        const nameInput =
            document.getElementById("usernameInput");

        if (nameInput) {

            nameInput.addEventListener(
                "keydown",
                event => {

                    if (event.key === "Enter") {

                        joinDavid();

                    }

                }
            );

        }

    }
);
