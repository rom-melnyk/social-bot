var nodemailer = require('nodemailer');

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
var createMailBody = function (data) {
    var htmlTemplate = '';
    data.forEach(function (item) {
        htmlTemplate += /*"Post: " + item.instance.text ? item.instance.text : item.instance.message + "<br/> network: " + item.network + */"<a href=http://vk.com/public" + (-item.instance.to_id) + "?w=wall" + item.instance.to_id + "_" + item.instance.id + ">Read on VK</a>" + "-----------------------------------------------------------<br>";
    });
    return mailOptions = {
        from: 'Social Bot ✔', // sender address
        to: 'olehbr29@gmail.com', // list of receivers
        subject: 'Social bot notification', // Subject line
        //text: "Post: " + data[0].instance + " network: " + data[0].network, // plaintext body
        html: htmlTemplate // html body
    };
}
// send mail with defined transport object
module.exports = function (dataArray) {
    var mailOptions = createMailBody(dataArray);
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            console.log(error);
        }else{
            console.log('Message sent: ' + JSON.stringify(info));
        }
    });
};