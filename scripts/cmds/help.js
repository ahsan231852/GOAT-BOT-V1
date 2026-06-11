const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");
const { getPrefix } = global.utils;
const { commands, aliases } = global.GoatBot;

const doNotDelete = "〲 𝗔𝗡𝗔𝗦 𝗕𝗢𝗧 〲";

module.exports = {
 config: {
 name: "help",
 version: "2.0",
 author: "ANAS",
 countDown: 3,
 role: 0,
 shortDescription: { en: "Neural Command Interface" },
 longDescription: { en: "Advanced command system with holographic UI" },
 category: "info",
 guide: { en: "{pn} [command | --search <term> | --detailed]" },
 priority: 1
 },

 langs: {
 en: {

   // 🔥 ONLY MAIN MENU DESIGN CHANGED
   mainMenu:
     "╔════════════════════════════════════════════╗\n" +
     "║           🤖  𝗔𝗡𝗔𝗦 𝗕𝗢𝗧 𝗠𝗘𝗡𝗨           ║\n" +
     "╠════════════════════════════════════════════╣\n" +
     "%1\n" +
     "╠════════════════════════════════════════════╣\n" +
     "║ 📦 𝗧𝗢𝗧𝗔𝗟 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦 : %2\n" +
     "║ ⚡ 𝗣𝗥𝗘𝗙𝗜𝗫 : [ %3 ]\n" +
     "╚════════════════════════════════════════════╝\n",

   categoryView:
     "┌────────────────────────────────────────────┐\n" +
     "│        🎮 [%1]  𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗦𝗘𝗖𝗧𝗢𝗥        │\n" +
     "├────────────────────────────────────────────┤\n" +
     "%2\n" +
     "└────────────────────────────────────────────┘",

   searchResults:
     "🔍 SEARCH RESULTS\n━━━━━━━━━━━━━━━━━━━━\n%1\n━━━━━━━━━━━━━━━━━━━━\n📊 Matches: %2 | ⏱ %3ms",

   commandInfo:
     "╔════════════════════════════════════════════╗\n" +
     "║        🧬 𝗔𝗡𝗔𝗦 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗜𝗡𝗙𝗢        ║\n" +
     "╠════════════════════════════════════════════╣\n" +
     "║ 🏷️ Name: %1\n" +
     "║ 📝 Desc: %2\n" +
     "║ 🔗 Alias: %3\n" +
     "║ 🧬 Ver: %4\n" +
     "║ 🛡️ Role: %5\n" +
     "║ ⏳ Cool: %6s\n" +
     "║ 👤 Author: %7\n" +
     "╠════════════════════════════════════════════╣\n" +
     "%8\n" +
     "╚════════════════════════════════════════════╝\n" +
     "✨ %9",

   commandNotFound: "⚠️ Command \"%1\" not found",
   noResults: "❌ No results found for: %1"
 }
 },

 onStart: async function ({ message, args, event, threadsData, getLang, role }) {
   const prefix = getPrefix(event.threadID);

   const isSearch = args.includes("--search") || args.includes("-s");
   const isDetailed = args.includes("--detailed") || args.includes("-d");
   const isCategory = args.includes("--category") || args.includes("-c");

   let cleanArgs = args.filter(a => !a.startsWith("--") && !a.startsWith("-"));
   let searchTerm = "";

   if (isSearch && cleanArgs[0]) {
     searchTerm = cleanArgs.join(" ").toLowerCase();
     return this.searchCommands(message, getLang, prefix, role, searchTerm);
   }

   const targetCommand = cleanArgs[0] || "";
   const command = commands.get(targetCommand) || commands.get(aliases.get(targetCommand));

   if (command) {
     return this.showCommandInfo(message, getLang, prefix, command, isDetailed);
   }

   return this.showAllCommands(message, getLang, prefix, role);
 },

 // 🔥 ONLY UI DESIGN UPDATED HERE
 showAllCommands: async function(message, getLang, prefix, role) {
   const categories = {};
   let total = 0;

   for (const [name, value] of commands) {
     if (value.config.role > role) continue;

     const cat = (value.config.category || "OTHERS").toUpperCase();

     if (!categories[cat]) categories[cat] = [];

     categories[cat].push(name);
     total++;
   }

   const sorted = Object.keys(categories).sort();

   let text = "";

   for (const cat of sorted) {
     const cmds = categories[cat].sort();

     text += `╭─────⭓ ${cat}\n`;
     text += `│`;

     for (let i = 0; i < cmds.length; i++) {
       text += `✧${cmds[i]} `;
     }

     text += `\n╰───────────⭓\n\n`;
   }

   text += `
━━━━━━━━━━━━━━━━━━
📦 Total Commands: ${total}
⚡ Prefix: ${prefix}
👑 Admin: ANAS 💢

📘 Facebook: https://www.facebook.com/Ur.Anu.NotYours
🚀 Powered By ANAS
━━━━━━━━━━━━━━━━━━
`;

   return message.reply(text);
 },

 searchCommands: async function(message, getLang, prefix, role, searchTerm) {
   const results = [];

   for (const [name, value] of commands) {
     if (value.config.role > role) continue;

     if (
       name.toLowerCase().includes(searchTerm) ||
       value.config.shortDescription?.en?.toLowerCase().includes(searchTerm)
     ) {
       results.push(`✧ ${name}`);
     }
   }

   if (!results.length)
     return message.reply(getLang("noResults", searchTerm));

   return message.reply(results.slice(0, 15).join("\n"));
 },

 showCommandInfo: async function(message, getLang, prefix, command, isDetailed) {
   const c = command.config;

   let guide = c.guide?.en || "";
   if (typeof guide === "object") guide = guide.body;

   const usage = guide.replace(/\{pn\}/g, prefix + c.name);

   return message.reply(
     getLang(
       "commandInfo",
       c.name,
       c.shortDescription?.en || "No desc",
       c.aliases?.join(", ") || "None",
       c.version || "2.0",
       c.role,
       c.countDown || 1,
       c.author || "ANAS",
       usage,
       "Powered By ANAS"
     )
   );
 }
};
