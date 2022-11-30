
function showNotifierPrompt(txt, color) {
    
    let notifier = document.getElementById("login_notification")
    notifier.innerText = txt
    notifier.style.setProperty('background-color', 'darkgreen')
    notifier.className = notifier.className.replace('hidden', 'active')
    setTimeout(() => {
        notifier.className = notifier.className.replace('active', 'hidden')
    }, 5000)

}

window.addEventListener('load', (ev) => {

    let signInLabel = "Sign In"
    let signUpLabel = "Sign Up"
    var curLoginUIPrompt = signInLabel

    document.getElementById('btn-toggle').addEventListener('click', (ev) => {

        ev.preventDefault()

        let toggle = document.getElementById('btn-toggle')
        let label = document.getElementById('login_form_label')

        label.innerText = curLoginUIPrompt
        if (curLoginUIPrompt == signInLabel) {
            curLoginUIPrompt = signUpLabel
        } else {
            curLoginUIPrompt = signInLabel
        }
        toggle.innerText = curLoginUIPrompt
    })

    document.getElementById('btn-signin').addEventListener('click', (ev) => {

        // Do not submit form
        ev.preventDefault()

        let user_in = document.getElementById('input-username')
        let pass_in = document.getElementById('input-password')
        var api_root = '../api'
        
        // Submit the login
        doRequest(
            'POST', 
            curLoginUIPrompt == signInLabel ? `${api_root}/login` : `${api_root}/account`, 
            `user=${user_in.value}&pass=${pass_in.value}`
        )
        .then((res) => showNotifierPrompt(`${curLoginUIPrompt} Successful!`, 'darkgreen'))
        .catch((err) => showNotifierPrompt('Invalid credentials! Try again.', 'red'))

        // Reset fields
        user_in.value = ''
        pass_in.value = ''
    })

})