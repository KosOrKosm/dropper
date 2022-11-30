
function doRequest(method, URL, body) {
    return new Promise(function (resolve, reject) {
        const xhr = new XMLHttpRequest()
        xhr.open(method, URL)
        if(body != null && body != undefined) {
            if (!(body instanceof FormData))
                xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
        }
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
