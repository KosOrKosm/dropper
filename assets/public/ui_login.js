
window.addEventListener('load', (ev) => {

    document.getElementById('btn-signin').addEventListener('click', (ev) => {

        // Do not submit form
        ev.preventDefault()

        let user_in = document.getElementById('input-username')
        let pass_in = document.getElementById('input-password')
        var api_root = '../api'
    
        // Submit the login
        doRequest(
            'POST', 
            `${api_root}/login`, 
            `user=${user_in.value}&pass=${pass_in.value}`
        ).then((res) => {
            // TODO: show a popup indicating success
        }).catch((err) => {
            // TODO: show a popup indicating failure
            alert('Failed to login! Try again.')
        })

        // Reset fields
        user_in.value = ''
        pass_in.value = ''

    })

})