
window.addEventListener('load', async (ev) => {

    try {

        let files_container = document.getElementById('file-container')

        // Get the template
        let template = Handlebars.compile(await doRequest(
            'GET', 
            '../assets/templates/files.handlebars'
        ))

        // Get files from the API
        let files = {
            files: JSON.parse(await doRequest(
                'GET', 
                '../api/file/all'
            ))
        }

        console.log(files)

        // Construct a file list from the template and send to container
        files_container.innerHTML = template(files)

    } catch (err) {

        if (err.status == 401) {
            // Not logged in
            window.location.replace("login")
        } else {
            alert("Unable to load files. Please try again.")
        }
    }

})