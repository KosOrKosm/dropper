
window.addEventListener('load', async (ev) => {

    try {

        let files_container = document.getElementById('files-list-container')

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

})