

async function refreshFiles() {

    let files_container = document.getElementById('files-list-container')

    while(files_container.getElementsByClassName('file-man-fileroot').length > 0) {
        files_container.removeChild(files_container.getElementsByClassName('file-man-fileroot')[0])
    }

    try {

        // Get the template
        let template = Handlebars.compile(await doRequest(
            'GET', 
            '../assets/templates/files.handlebars'
        ))

        // Get files from the API
        let data = {
            files: JSON.parse(await doRequest(
                'GET', 
                '../api/file/all'
            ))
        }

        // Extract file extensions
        data.files.forEach(f => f.Ext = /(?:\.([^.]+))?$/.exec(f.Key)[1])

        // Construct a file list from the template and send to container
        files_container.innerHTML += template(data)

    } catch (err) {

        if (err.status == 401) {
            // Not logged in
            window.location.replace("login")
        } else {
            alert("Unable to load files. Please try again.")
        }
    }

    document.getElementById('upload-btn').addEventListener('click', (ev) => {
        
        ev.preventDefault()

        console.log('Waiting for file')

        var fileReq = document.createElement('input')
        fileReq.type = 'file'
        fileReq.name = 'file'
        fileReq.onchange = () => {
            if (fileReq.files != undefined && fileReq.files[0] != undefined) {

                console.log(`Attempting to upload file ${fileReq.files[0].name}`)

                let file = fileReq.files[0]
                var data = new FormData()
                data.set('file', file, file.name)
    
                doRequest(
                    'PUT',
                    '../api/file',
                    data
                )
                .then(res => {
                    alert('Upload succeeded')
                    refreshFiles()
                })
                .catch(err => {
                    alert('Upload failed')
                })
    
            }

        }
        fileReq.click()

    })

}

window.addEventListener('load', (ev) => {

    refreshFiles()

    window.deleteFile = (filename) => {
        doRequest(
            'DELETE', 
            `../api/file?file=${filename}`
        ).then(() => {
            console.log("File deleted")
            refreshFiles()
        })
    }

})