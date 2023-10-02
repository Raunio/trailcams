import * as nodemailer from 'nodemailer';
import * as fs from 'fs';

describe('send test email', () => {
    const smptUser = 'AKIASXL6VVILKQUGXSWD';
    const smptPassword = 'BGWpAvP+IZ/9u5rktbzlXWaIAptHIIVaQjC3EhK2fduM';

    it('should send test email', async () => {
        const transporter = nodemailer.createTransport({
            host: 'email-smtp.eu-west-1.amazonaws.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: smptUser,
                pass: smptPassword,
            },
        });

        // verify connection configuration
        await transporter.verify(function (error) {
            if (error) {
                console.log(error);
            } else {
                console.log('Server is ready to take our messages');
            }
        });

        // send mail with defined transport object
        await transporter.sendMail({
            from: 'test-user@trailcams.click', // sender address
            to: 'reijo.mallikas@trailcams.click', // list of receivers
            subject: 'Hello ✔', // Subject line
            text: 'Hello world?', // plain text body
            html: '<b>Hello world?</b>', // html body
            attachments: [
                {
                    filename: 'moose_640.jpg',
                    content: Buffer.from(fs.readFileSync('moose_640.jpg')),
                },
            ],
        });
    });
});
