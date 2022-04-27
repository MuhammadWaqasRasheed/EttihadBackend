var nodemailer = require("nodemailer");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "waqasrasheed438@gmail.com",
    pass: "Waqas@5142",
  },
});

let sendEmail = async (recipientList, msg) => {
  let mailOptions = {
    from: "waqasrasheed438@gmail.com",
    to: recipientList.toString(),
    subject: "Node JS & Ittehad Chemicals Alerts",
    // text: msg,
    html: `
        <h1>Warning Message</h1>
        ${msg}
    `,
  };

  try {
    const msg = await transporter.sendMail(mailOptions);
    return msg.response;
  } catch (error) {
    console.log(error);
    return error;
  }
};

let recipientList = ["waqasrasheed605@gmail.com", "waqasrasheed5005@gmail.com"];

// sendEmail(recipientList, "test message");

module.exports = sendEmail;

// let mailOptions = {
//     from: "waqasrasheed438@gmail.com",
//     to: "waqasrasheed605@gmail.com,waqasrasheed5005@gmail.com",
//     subject: "Node JS & Ittehad Chemicals Alerts",
//     text: `hello this is alert message from Ittehad Chemicals`,
//     html: "<h1>Hello Alert</h1>",
//   };
