const axios = require("axios");

const path = "https://ApiEmail.teleperformance.co/api/sendEmail";

exports.sendEmail = async (emailInfo, subject, header, emailSender) => {
  try {
    const { userName, resultTest } = emailInfo;
    const resultSplit = resultTest.split("/");

    let welcomeEmailTemplate = `
        <!DOCTYPE html>
        <html lang="en"   >
          <head>
            <meta charset="UTF-8" />
            <meta http-equiv="X-UA-Compatible" content="IE=edge" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>TpFeel Email</title>
          </head>
          <body
          align="center"
          style="
            background: #f8f9fa;
          >
        <center>    
        <table
          align="center"
          style="
            width: 500px;
            background-color: #fdfdfd;
            box-shadow: 5px 5px 5px #8a8989;
            margin: 3rem;"
          >
            <tr>
            <td align="center">
            <img
            border="0"
            width="500"
            height="157"
            style="width: 5.20833in; height: 1.635416in"
            src="https://firebasestorage.googleapis.com/v0/b/feel-platform/o/Logos%2FfeelLogo.png?alt=media&token=50f161f7-4618-4555-b55d-26c5d5655d9e"
            alt="header"
            />
            </td>
            </tr>
            <tr  style="width: 500px">
              <td >
              <table align="center" width="436" style="margin:auto">
                  <tr><td>
                    <h2 style="margin-bottom:3px">TEST BSPT RESULT: ${userName}</h2>                   
                  </td></tr>
              </table>
              </td>
            </tr>
            <tr>
              <table align="center">
              <tbody>
                <tr>
                  <td>Peacock</td>
                  <td>Owl</td>
                  <td>Eagle</td>
                  <td>Dove</td>
                </tr>
                <tr>
                  <td>${resultSplit[0]}</td>
                  <td>${resultSplit[1]}</td>
                  <td>${resultSplit[2]}</td>
                  <td>${resultSplit[3]}</td>
                </tr>
              </tbody>
              </table>
            </tr>           
            <tr>
              <td class="footer">
                <img
                border="0"
                width="500"
                height="33"
                style="width: 5.20833in; height: 0.34375in"
                src="https://firebasestorage.googleapis.com/v0/b/storage-296723/o/Gamification%2FemailResources%2Femail%20descriptionImage?alt=media&token=57098326-6a60-4e40-86a7-732a6a038141"
                alt="footer"
                />
              </td>
            </tr>
        </table>
        </center>
        </body>
        </html> `;

    let message = {
      emails: `deiby.ninogarces@teleperformance.com,diego.tapiaspinzon@teleperformance.com`,
      subject,
      name: header,
      emailSender,
      HTML: welcomeEmailTemplate,
    };

    await axios.post(path, message);
  } catch (error) {
    console.log(error);
    return error;
  }
};
