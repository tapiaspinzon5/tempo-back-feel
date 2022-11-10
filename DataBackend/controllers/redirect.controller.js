const axios = require('axios');
const properties = require('../properties/properties')



let post = (url, path, body, token) => {
    return new Promise((resolve, reject) => {
        let headers = { headers: tokenize(token) }
        axios.post(url + path, body, headers)
            .then(respuesta => resolve(respuesta))
            .catch(error => {
                // console.log(error);
                reject(error.response.data)
            });
    })
}

let tokenize = (token) => {
    let headers = properties.headers
    if (token) {
        headers[process.env.AUTH] = 'Bearer ' + token
        return headers
    } else {
        return headers
    }
}

module.exports = { post, tokenize }