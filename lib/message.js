///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Dependencies //////////////////////////////////////////////////////////////////////////////////////////////////////////
const {
  MessageActionRow,
  Message,
  MessageEmbed,
  MessageButton
} = require("discord.js");
const disabledButtons = require('../util/disabledButtons');
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Params ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/**
 * @param {Message} message
 * @param {MessageEmbed[]} pages
 * @param {MessageButton[]} buttonList
 * @param {number} timeout
 * @returns The pagination
*/
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Message pagination ////////////////////////////////////////////////////////////////////////////////////////////////////
module.exports = MessagePagination = async (message, pages, buttonList, timeout, menu) => {
   // Set page number
   let page = 0;
   // Create embed
   const row = new MessageActionRow().addComponents(buttonList);
   const row2 = new MessageActionRow().addComponents(menu);
   let curPage = await message.reply({
      embeds: [pages[page]],
      components: [row, row2],
   });
   // Create filter
   let filter 
   if (buttonList.length === 2) {
      filter = (i) =>
         i.customId === buttonList[0].customId ||
         i.customId === buttonList[1].customId;
   }
   // Create collector
   const collector = await curPage.createMessageComponentCollector({
      filter,
      time: timeout,
   });
   // Button inputs
   collector.on("collect", async (i) => {
      switch (i.customId) {
         // Button 1
         case buttonList[0].customId:
         if (buttonList.length > 3) {
            page = 0;
            break;
         }
         page = page > 0 ? --page : pages.length - 1;
         break;
         // Button 2
         case buttonList[1].customId:
         if (buttonList.length > 3) {
            page = page > 0 ? --page : pages.length - 1;
            break;
         }
         page = page + 1 < pages.length ? ++page : 0;
         break;
         // Default
         default:
         break;
      }
      await i.deferUpdate();
      await i.editReply({
         embeds: [pages[page]],
         components: [row, row2],
      });
      collector.resetTimer();
   });
   // Timeout or embed was deleted
   collector.on("end", async() => {
      try {
         await message.channel.messages.fetch(curPage.id);
         try {
         curPage.edit({
            embeds: [pages[page]],
            components: [],
         });
         } catch (error) {return}
      } catch (error) {return}
   });
   return curPage;
};
