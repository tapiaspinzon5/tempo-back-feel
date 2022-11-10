require("dotenv").config();
const crypto = require("crypto");
const algorithm = process.env.ALGORITHM;
const key = Buffer.from(process.env.KEY);
const iv = Buffer.from(process.env.IV);

exports.encrypt = (text) => {
  try {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(key), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return encrypted.toString("hex");
  } catch (error) {
    return error;
  }
};

exports.decrypt = (text) => {
  try {
    let encryptedText = Buffer.from(text, "hex");
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return error;
  }
};

let value =
  "b290db87f18358c3a7efc77f3fc22e22e1eb565b3a8bb4a355399d2a7d5bcd4c89c9f8b0343ef930ceb93dc185752a78acf6ee875f4ecaca8aea881f893f57201f469ec42970de05e5ed45e291735c0471fd57dcad68864a501e4df4c6ffb1e84843c70f2c9ef049598092bcf043ba24849272bd6acd509ae484b610369d5c7f09fa6c07832e1941cbf9e6f507eb153eb8772af951345c750c34569aa22556f843816602ac99d120dac4365222854b890c6a452f0225c46ddca4e19397dca1f026c84c262d175d2fc8b792f07bf240aa457fb61db20c80d982beebf5aac5d8e75d063009d3befddf1aa3c6e7048b6072ff7dd60b6e8c91810b11b75a66420ef085d6fff0e746b4b81a5e2784ca2255d3753276bc9d9f1cff46d609f530244c9b178cb0d9e36c6c9673691296ccebe90b2f11a1eb2c124d4faa31105ef87796d8";

const axios = require("axios");

let ipAddress = (ip) => {
  return new Promise((resolve, reject) => {
    async function poster() {
      try {
        const response = await axios.post(
          process.env.URLCCMS,
          {
            jsonrpc: "1.1",
            id: 1,
            method: "System.CheckAllowList",
            params: [{ address: ip, netmask: "255.255.255.255", list: "ccms" }],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Basic cnBjLnRwZ3JvdXAubXl0cF8wMTpVJFBncEozNThNRG1leV5idlE=",
            },
          }
        );
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    }
    poster();
  });
};

let ccmsData = (user) => {
  return new Promise((resolve, reject) => {
    async function poster() {
      try {
        const response = await axios.post(
          process.env.URLCCMS,
          {
            jsonrpc: "1.1",
            id: 1,
            method: "Schedule.BuildEmployeeSchedule",
            params: [
              {
                employee_ident: user,
                end_date: "2020-05-01",
                start_date: "2020-05-01",
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Basic cnBjLnRwY28udHByZWNydWl0XzAxOkpKbVRxRFN4R1o1Mm5NRQ==",
            },
          }
        );
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    }
    poster();
  });
};

let persona = "briam";
let edadbriam = 28;
let pelo = "poco";
let funcionbriam = (quien, edadbriam) => {
  let edadtuvohijomayor = edadbriam - 8;
};

funcionbriam(persona, edadbriam);

let ccmsDataDetails = (user) => {
  return new Promise((resolve, reject) => {
    async function poster() {
      try {
        const response = await axios.post(
          process.env.URLCCMS,
          {
            jsonrpc: "1.1",
            id: 1,
            method: "Schedule.BuildEmployeeScheduleDetail",
            params: [
              {
                employee_ident: 2274595,
                end_unix_timestamp: 1588455000,
                start_unix_timestamp: 1588338000,
              },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization:
                "Basic cnBjLnRwY28udHByZWNydWl0XzAxOkpKbVRxRFN4R1o1Mm5NRQ==",
            },
          }
        );
        resolve(response.data);
      } catch (error) {
        reject(error);
      }
    }
    poster();
  });
};
