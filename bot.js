const { Telegraf } = require('telegraf');
const fs = require('fs');
require('dotenv').config();

const { BOT_TOKEN } = process.env;  

const ADMIN_ID = Number(process.env.ADMIN_ID);//env braucht man um seine Information zu stecken und env.example für das gleiche aber für eine Person(user), die das Bot verwendet wird 



const bot = new Telegraf(BOT_TOKEN);//dieses Token ist für Telegram für neue Bots

const wishlist = JSON.parse(fs.readFileSync('wishlist.json', 'utf8'))//utf8 ist eine Codierung, in der wir es lesen können werden//DAS IST ALLE GESCHENKE AUS WISHLIST.JSON
// JSON.parse wandelt alles was in ('') steht in einen Massiv um// umwandeln = transformieren, preobrasovuvat
bot.start((ctx) => ctx.reply('Your wish-list that you can change'));

bot.command('wishlist', (ctx) =>{
    const gifts = wishlist.map((gift, index) => {
        const bought = gift.boughtBy 
        ? `(will bought by ${gift.boughtBy})`
        : `(nobody bought)`
        const row = `${index + 1}. ${gift.title} ${bought}`;
        return row;  
    });//map erhaltet Callback Function
    ctx.reply(`list of all gifts:\n${gifts.join('\n')}`);   
});

bot.command('add', (ctx) =>{// /add any gift
    if(ctx.from.id !== ADMIN_ID){
        ctx.reply('You can not add any gift in this wish-list')
        return;
    }
    const giftTitle = ctx.message.text
    .split(' ')// umwandeln in einen Massiv ´
    .slice(1)// wälen ab den zweiten Elem bzw. any gift, /add wird entfernt
    .join(' ');// wiedergeben den Object
    const gift = {title: giftTitle, boughtBy: null};
    wishlist.push(gift);
    fs.writeFileSync(
    'wishlist.json', 
    JSON.stringify(wishlist, null, 2),  
    'utf8'
    );//das ganze ist eine Wendung an wishlist.json// JSON.stringify fürs Screiben  Massivs in File(wishlist.json)// 2 ist Space zwischen Elementen       
    ctx.reply(
        `Gift ${giftTitle} was succsessfully added`, 
    );
});

bot.command('delete', (ctx) =>{
    if(ctx.from.id !== ADMIN_ID){
        ctx.reply('You can not delete any gift from this wish-list')
        return;
    }
    const giftIndex = Number(ctx.message.text.split(" ")[1]);
    const [deletedGift] = wishlist.splice(giftIndex -1, 1)
    fs.writeFileSync(
        'wishlist.json', 
        JSON.stringify(wishlist, null, 2),  
        'utf8'
        );
    ctx.reply(`Gift ${deletedGift.title} successfully deleted`);
});

bot.command('buy', (ctx) =>{
    const giftIndex = Number(ctx.message.text.split(" ")[1]);
    wishlist[giftIndex -1].boughtBy = ctx.from.username;
    fs.writeFileSync(
        'wishlist.json', 
        JSON.stringify(wishlist, null, 2),  
        'utf8'
    );
    ctx.reply(`Gift  ${
        wishlist[giftIndex -1].title
        } will bought by ${ctx.from.username}`, 
    )
});

bot.launch();


process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));