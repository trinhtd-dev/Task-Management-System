import nodemailer from 'nodemailer';

export const sendMail = async (to: string, subject: string, html: string) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'maddison53@ethereal.email', // generated ethereal user
            pass: 'jn7jnAPss4f63QBp6D', // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Task Management System" <no-reply@taskmanagement.com>', // sender address
        to: to, // list of receivers
        subject: subject, // Subject line
        html: html, // html body
    });

    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@ethereal.email>

    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}; 