var nodemailer = require('nodemailer'),
	User = require('../db/user-model');

// create reusable transporter object using SMTP transport
var transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: 'botsawyer@gmail.com',
        pass: 'simplepass123'
    }
});

// NB! No need to recreate the transporter object. You can use
// the same transporter object for all e-mails

// setup e-mail data with unicode symbols
var createMailBody = function (data, user) {
    var htmlTemplate = '', userEmails = [];
    data.forEach(function (item) {
        if (item.network === 'vk') {
            htmlTemplate += "Знайдено ключових слів: " + item.found + "<div style='text-overflow:ellipsis; max-width: 500px; white-space: nowrap; overflow: hidden; max-height: 16px;'> Post: " + (item.instance.text ? item.instance.text : 'Даний пост не має тексту повідомлення') + "</div><br/> Соціальна мережа: " + item.network + "<br>" +
                "<a href=http://vk.com/public" + (-item.instance.to_id) + "?w=wall" + item.instance.to_id + "_" + item.instance.id + ">Read on VK</a><br>" +
                "-----------------------------------------------------------<br>";
        } else if (item.network === "fb") {
            htmlTemplate += "Знайдено ключових слів: " + item.found + " <div style='text-overflow:ellipsis; max-width: 500px; white-space: nowrap; overflow: hidden; max-height: 16px;'>Post: " + (item.instance.message ? item.instance.message : 'Даний пост не має тексту повідомлення') + "</div><br/> Соціальна мережа: " + item.network + "<br>" +
                "<a href='" + (item.instance.link || item.instance.actions[0].link) + "'>Read on Facebook</a><br>" +
                "-----------------------------------------------------------<br>";
        }
    });
    mailOptions = {
        from: 'Social Bot ✔', // sender address
        to: user.email, // list of receivers
        subject: 'Social bot notification', // Subject line
        //text: "Post: " + data[0].instance + " network: " + data[0].network, // plaintext body
        html: htmlTemplate // html body
    };
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Message sent: ' + JSON.stringify(info));
        }
    });
}
// send mail with defined transport object
module.exports = function (dataArray, user) {
    var mailOptions = createMailBody(dataArray, user);
};