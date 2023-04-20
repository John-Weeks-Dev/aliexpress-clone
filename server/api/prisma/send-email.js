import nodemailer from 'nodemailer'

export default defineEventHandler(async (event) => {
    const body = await readBody(event)

    var transporter = nodemailer.createTransport({
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_EMAIL,
                pass: process.env.MAIL_PASSWORD
            }
    });

    const emailHtml = `
        <h1>Order information</h1>
        <ul>
            <li>Your order will arrive in 1 week</li>
            <li>Stripe ID: ${body.stripeId}</li>
            <li>Total: $${body.price / 100}</li>
        </ul>
        <p>Thanks, AliExpress Clone</p>
    `
      
      var mailOptions = {
        from: process.env.SITE_EMAIL,
        to: body.toEmail,
        subject: "New Order - AliExpress Clone",
        html: emailHtml
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
})