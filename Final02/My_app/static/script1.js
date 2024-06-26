window.onload = function() {
    let bodyId = document.body.id;
    if(bodyId === 'login') {
        document.getElementById('login_button').addEventListener('click', function(event){
            event.preventDefault();
            let username = document.getElementById('username').value;
            let password = document.getElementById('password').value;
            
            fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                }),
            })
            .then(response => response.json())
            .then(data => {
                if(data.message === 'Logged in successfully.' || data.message === 'Registered and logged in successfully.'){
                    window.location.href = '/chatbot';
                }else{
                    alert('Špatné jméno nebo heslo');
                }
            })
        })
    }
}