
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
            let notifier = document.getElementById("login_notification")
            notifier.innerText = 'Login Successful!'
            notifier.style.setProperty('background-color', 'darkgreen')
            notifier.className = notifier.className.replace('hidden', 'active')
            setTimeout(() => {
                notifier.className = notifier.className.replace('active', 'hidden')
            }, 5000)
        }).catch((err) => {
            let notifier = document.getElementById("login_notification")
            notifier.innerText = 'Invalid credentials! Try again.'
            notifier.style.setProperty('background-color', 'red')
            notifier.className = notifier.className.replace('hidden', 'active')
            setTimeout(() => {
                notifier.className = notifier.className.replace('active', 'hidden')
            }, 5000)
        })

        // Reset fields
        user_in.value = ''
        pass_in.value = ''
    })

})