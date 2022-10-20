console.log("Welcome to script.js");

function doRequest(method, URL, body) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest()
        xhr.open(method, URL)
        if(body != null && body != undefined)
            xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        xhr.onload = function () {
            if (this.status >= 200 && this.status < 300) {
                resolve(xhr.response)
            } else {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                })
            }
        }
        xhr.onerror = function () {
            reject({
                status: this.status,
                statusText: xhr.statusText
            })
        }
        xhr.send(body)
    })
}

let username = "admin";
let password = "admin";

// http://dropper-dev.us-west-1.elasticbeanstalk.com/

// doRequest('POST', 'http://dropper-dev.us-west-1.elasticbeanstalk.com/api/login', `user=${username}&pass=${password}`)

// .then((res) => {
//     console.log(`Session was created. Response from server: ${JSON.stringify(res)}`)
// })

setUserAndPass = () => {
    user = document.getElementById('username').value;
    pass = document.getElementById('password').value;
    console.log(user);
    console.log(pass);

};