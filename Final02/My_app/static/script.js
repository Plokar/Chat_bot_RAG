/* ///   GENEROVÁNÍ STARÉ HISTORIE  /// */
    
document.addEventListener('DOMContentLoaded', function() {
    fetch('/api-seasons') 
        .then(response => response.json())
        .then(seasons => {
            let history_div = document.getElementById('historie');
            seasons.forEach(season => {
                let history_button = document.createElement('button');
                let delete_history_button = document.createElement('button');

                history_button.classList.add('history_button');
                delete_history_button.classList.add('delete_history')

                history_button.textContent = season.content_summary;
                delete_history_button.textContent = "\u2715";

                history_button.addEventListener('click', getChatHistory);
                delete_history_button.addEventListener('click', deletehistory);

                history_button.id = 'Button_history_season_' + season.id;
                delete_history_button.id = 'Button_delete_history_season_' + season.id;
               
                history_button.appendChild(delete_history_button);
                history_div.appendChild(history_button);
            });
        })
        .catch((error) => {
            console.error('Error:', error);
        });
  
});



/* ///   RAG BUTTN   /// */
let state = 1;
document.getElementById('toggleButton').addEventListener('click', function(){
    let toggle_onoff_indicator = document.getElementById('toggleButton_indicator');
    if(state == 0){
        toggle_onoff_indicator.style.backgroundColor = "Red";
        console.log("RAG OFF");
        state = 1  
    }else if(state == 1){
        toggle_onoff_indicator.style.backgroundColor = "Green";
        console.log("RAG ON");
        state = 0
    }
})

/* ///   UPLOAD BUTTN    /// */
//showing UI
let state2 = 0;
document.getElementById('send_file_button').addEventListener('click', function(){
    let log_background = document.getElementById('log_background');
    let dev_background = document.getElementById('dev_background');
    let send_file_background = document.getElementById('send_file_background');
    if(state2 == 0){
        send_file_background.style.display = "block";
        log_background.style.display = "none";
        dev_background.style.display = "none";
        state3 = 0;
        state4 = 0;
        state2 = 1;
    }else if(state2 == 1){
        send_file_background.style.display = "none";
        state2 = 0;
    }
})
//closing send_file after upload
document.getElementById('file_upload_button').addEventListener('click', function(e){
    e.preventDefault();
    let send_file_background = document.getElementById('send_file_background');
    send_file_background.style.display = "none";
    state2 = 0;
})
//picking file
let fileUpload = document.getElementById('file_upload');
let uploadButton = document.getElementById('file_upload_button_input');
let uploadStatus = document.getElementById('upload_status');
uploadButton.addEventListener('click', function(e) {
    e.preventDefault();
    fileUpload.click();
});

function upload_to_back(){
    
    let fileUpload = document.getElementById('file_upload').value;
    let webpageUrl = document.getElementById('webpage_url').value;

    if(fileUpload && webpageUrl){
        alert('Nelze nahrát oba soubory najednou');
        return;
    }else if(!fileUpload && !webpageUrl){
        alert('Není vybrán soubor ani URL');
        return;
    }else if(fileUpload){
        let formData = new FormData();
        let fileField = document.querySelector('input[type="file"]');

        formData.append('file_upload', fileField.files[0]);

        fetch('/upload/file', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())  
        .then(data => {
            alert(JSON.stringify(data));
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }else if(webpageUrl){
        fetch('/upload/webpage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'webpage_url=' + encodeURIComponent(webpageUrl),
        })
        .then(response => response.json())
        .then(data => {
            alert(JSON.stringify(data));
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }

}

document.getElementById('file_upload_button').addEventListener('click', function(e){
    e.preventDefault(); // prevent sending
    upload_to_back();
})



/* ///   DELETE FILE FUNCTION    /// */
function delete_file(event){
    let parts = event.target.id.split('_', 1);
    let action = parts[0];
    let file_name = event.target.id.substring(action.length + 1);

    fetch('/api/file_delete', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'file_name=' + encodeURIComponent(file_name),
    })
    .then(response => response.text())
    .then(data => {
        let file_sql_space_wraper = document.getElementById('delete_' + file_name).parentNode;
        file_sql_space_wraper.parentNode.removeChild(file_sql_space_wraper);
    })
    .catch((error) => {
        console.error('Error:', error);
    });

}

/* ///   LOG BUTTN    /// */
let state3 =0;
document.getElementById('log_button').addEventListener('click', function(){
    let log_background = document.getElementById('log_background');
    let dev_background = document.getElementById('dev_background');
    let send_file_background = document.getElementById('send_file_background');
    if(state3 == 0){
        log_background.style.display = "block";
        dev_background.style.display = "none";
        send_file_background.style.display = "none";
        state3 = 1;
        state2 = 0;
        state4 = 0;
    }else if(state3 == 1){
        log_background.style.display = "none";
        state3 = 0;
    }

    while (log_output.firstChild) {
        log_output.removeChild(log_output.firstChild);
    }

    fetch('/api/file_sql',{
        method: 'GET',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
    })
    .then(response => response.json())
    .then(data => {
        let log_output = document.getElementById('log_output');
        data.forEach(item => {

            let file_sql_space_wraper = document.createElement('div');
            let file_sql_space = document.createElement('p')
            let delete_button = document.createElement('button')
            
            file_sql_space.classList.add('file_sql_list_space');
            delete_button.classList.add('delete_file'); 
            file_sql_space_wraper.classList.add('file_sql_space_wraper')
            delete_button.id = 'delete_' + item.text;
            delete_button.addEventListener('click', delete_file);

            file_sql_space.textContent = item.text;
            delete_button.textContent = "\u2715";

            file_sql_space_wraper.appendChild(file_sql_space);
            file_sql_space_wraper.appendChild(delete_button);
            log_output.appendChild(file_sql_space_wraper);
            console.log(data);
        });
    })
    .catch((error) => {
        console.error('Error:', error);
    });

});


/* ///   DEV BUTTN    /// */
let state4 = 0;
document.getElementById('dev_chats_button').addEventListener('click', function(){
    let dev_background = document.getElementById('dev_background');
    let log_background = document.getElementById('log_background');
    let send_file_background = document.getElementById('send_file_background');
    if(state4 == 0){
        dev_background.style.display = "block";
        log_background.style.display = "none";
        send_file_background.style.display = "none";
        state2 = 0;
        state3 = 0;
        state4 = 1;
    }else if(state4 == 1){
        dev_background.style.display = "none";
        state4 = 0;
    }
})

/* ///   EXIT-BUTTON    /// */
let exitButtons = document.getElementsByClassName('exit-button');
for(let i = 0; i < exitButtons.length; i++) {
    exitButtons[i].addEventListener('click', function(event){
        event.preventDefault();
        let log_background = document.getElementById('log_background');
        let dev_background = document.getElementById('dev_background');
        let send_file_background = document.getElementById('send_file_background');
        log_background.style.display = "none";
        dev_background.style.display = "none";
        send_file_background.style.display = "none";
        state2 = 0;
        state3 = 0;
        state4 = 0;
    });
}

/* ///   RECORDING AUDIO    /// */
let state5 = 0;
document.addEventListener('DOMContentLoaded', async () => {
    const buttn_mikrofon_off = document.getElementById('buttn_mikrofon_off')
    const mikrofon_on_icon = document.getElementById("mikrofon_on");
    const mikrofon_off_icon = document.getElementById("mikrofon_off");

    let mediaRecorder;
    let recorded_chunks = [];

    try {
        const stream = await navigator.mediaDevices.getUserMedia({audio : true});
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = event => {
            if(event.data.size > 0) recorded_chunks.push(event.data);
        };

        mediaRecorder.onstop = async () => {
            const audio_blob = new Blob(recorded_chunks, {type : 'audio/webm'});
            const fd = new FormData();
            fd.append('audio', audio_blob);

            try {
                const response2 = await fetch('/speach-text', {
                    method : 'POST',
                    body : fd
                });
                    if(response2.ok){
                        console.log('audio převedeno na text');
                        const returnedJson = await response2.json();

                        let userMessageDiv = document.createElement('pre');
                        userMessageDiv.classList.add('user_message');
                        userMessageDiv.textContent = returnedJson.text;

                        let user_circle_div = document.createElement('div')
                        user_circle_div.classList.add('user_circle')

                        let messageWrapper = document.createElement('div');
                        messageWrapper.classList.add('user_message_wrapper');

                        let chatWindow = document.getElementById('chat_background');
                        let messageContainer = chatWindow.querySelector('.message_container');
                        if (!messageContainer) {
                            messageContainer = document.createElement('div');
                            messageContainer.classList.add('message_container');
                            chatWindow.appendChild(messageContainer);
                        }
                        messageWrapper.appendChild(userMessageDiv);
                        messageWrapper.appendChild(user_circle_div);
                    
                    
                        messageContainer.appendChild(messageWrapper);
                        messageContainer.scrollTop = messageContainer.scrollHeight;

                    } else {
                        console.log('audio se nepodařilo převést na text', response2.statusText);
                    }
    
                const response = await fetch('/process-audio', {
                    method : 'POST',
                    body : fd
                });

                if(response.ok){
                    console.log('audio nahrano');
                
                    const responseText = await response.text();
                    console.log(responseText);
                    const parts = responseText.split('--BOUNDARY\r\n');
                    const jsonPart = parts.find(part => part.includes('application/json'));
                    const audioPart = parts.find(part => part.includes('audio/wav'));
                
                    const jsonText = jsonPart.split('\r\n\r\n')[1];
                    const audioData = audioPart.split('\r\n\r\n')[1];
                
                    const jsonData = JSON.parse(jsonText);

                    let backendMessageDiv = document.createElement('div');
                    backendMessageDiv.classList.add('backend_message');
                    backendMessageDiv.textContent = jsonData.text;

                    let backend_circle_div = document.createElement('div');
                    backend_circle_div.classList.add('backend_circle');

                    let messageWrapper2 = document.createElement('div');
                    messageWrapper2.classList.add('backend_message_wrapper');

                    messageWrapper2.appendChild(backend_circle_div);
                    messageWrapper2.appendChild(backendMessageDiv);
                    messageContainer.appendChild(messageWrapper2);
                    messageContainer.scrollTop = messageContainer.scrollHeight;
                
                    const audioBlob = new Blob([audioData], {type: 'audio/wav'});
                    const audioUrl = URL.createObjectURL(audioBlob);
                    const audio = new Audio(audioUrl);
                    audio.play();
                } else {
                    console.log('audio se nepodařilo nahrát', response.statusText);
                }
            } catch (error) {
                console.error('Chyba při zpracování audia:', error);
            }
        };
    } catch (error) {
        console.error('Chyba při nahrávání audio:', error);
    }

    buttn_mikrofon_off.addEventListener('click', function(){
        if(state5 == 0){
            mikrofon_on_icon.style.display = "none"
            mikrofon_off_icon.style.display = "block"
            if(mediaRecorder.state === 'recording'){
                mediaRecorder.stop();
                console.log('nahrávání vypnuto');
            }
            state5 = 1;
        }else if(state5 == 1){
            mikrofon_on_icon.style.display = "block"
            mikrofon_off_icon.style.display = "none"
            if(mediaRecorder.state === 'inactive'){
                recorded_chunks = [];
                mediaRecorder.start();
                console.log('nahrávání zapnuto');
            }
            state5 = 0;
        }
    
    })
});

/* ///   SENDING PROMPT TO THE BACKEND  WITH GENERATING CHAT  /// */
document.getElementById('send_button').addEventListener('click', function(event) {
    event.preventDefault();  // Zabraňuje odeslání formuláře
    let userText = document.getElementById('prompt_input').value;

    let userMessageDiv = document.createElement('pre');
    userMessageDiv.classList.add('user_message');
    userMessageDiv.textContent = userText;

    let user_circle_div = document.createElement('div')
    user_circle_div.classList.add('user_circle')

    let messageWrapper = document.createElement('div');
    messageWrapper.classList.add('user_message_wrapper');


    // Adding user messages to chat window
    let chatWindow = document.getElementById('chat_background');
    let messageContainer = chatWindow.querySelector('.message_container');
    if (!messageContainer) {
        messageContainer = document.createElement('div');
        messageContainer.classList.add('message_container');
        chatWindow.appendChild(messageContainer);
    }
    messageWrapper.appendChild(userMessageDiv);
    messageWrapper.appendChild(user_circle_div);


    messageContainer.appendChild(messageWrapper);
    messageContainer.scrollTop = messageContainer.scrollHeight;

    //sending data to the backend and getting respond
    if(state == 0){
        fetch('/get-text/rag',{
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'user_text=' + encodeURIComponent(userText),
        })
        .then(response => response.text())
        .then(data => {

            let backendMessageDiv = document.createElement('div');
            backendMessageDiv.classList.add('backend_message');
            backendMessageDiv.textContent = data;

            let backend_circle_div = document.createElement('div');
            backend_circle_div.classList.add('backend_circle');

            let messageWrapper2 = document.createElement('div');
            messageWrapper2.classList.add('backend_message_wrapper');

            messageWrapper2.appendChild(backend_circle_div);
            messageWrapper2.appendChild(backendMessageDiv);
            messageContainer.appendChild(messageWrapper2);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch((error) => {
            console.error('Error:', error);
        });

    }else{
        fetch('/get-text', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: 'user_text=' + encodeURIComponent(userText),
        })
        .then(response => response.text())
        .then(data => {
            let backendMessageDiv = document.createElement('div');
            backendMessageDiv.classList.add('backend_message');
            backendMessageDiv.textContent = data;

            let backend_circle_div = document.createElement('div');
            backend_circle_div.classList.add('backend_circle');

            let messageWrapper2 = document.createElement('div');
            messageWrapper2.classList.add('backend_message_wrapper');

            messageWrapper2.appendChild(backend_circle_div);
            messageWrapper2.appendChild(backendMessageDiv);
            messageContainer.appendChild(messageWrapper2);
            messageContainer.scrollTop = messageContainer.scrollHeight;
        })
        .catch((error) => {
            console.error('Error:', error);
        });
    }
});

/* ///   HISTORI    /// */
// Function for getting histori of the chat
function getChatHistory(event) {
    let elements = document.querySelectorAll('.backend_message_wrapper, .user_message_wrapper');
    for(let i=0; i<elements.length; i++){
        elements[i].parentNode.removeChild(elements[i]);
    }

    // Getting season_id from id button
    let season_id = event.target.id.split('_').pop();

    fetch('/api/history', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'season_id=' + encodeURIComponent(season_id),
    })
    .then(response => response.json())
    .then(messages => {
        // Sorting messeges by timestamp
        messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        // Regenerating flow of the chat
        messages.forEach(message => {
            let message_from_backend = message.response;
            let message_from_frontend = message.prompt;

            //generating chat from prompt
            let userMessageDiv = document.createElement('pre');
            userMessageDiv.classList.add('user_message');
            userMessageDiv.textContent = message_from_frontend;

            let user_circle_div = document.createElement('div')
            user_circle_div.classList.add('user_circle')

            let messageWrapper = document.createElement('div');
            messageWrapper.classList.add('user_message_wrapper');


            // Adding user message in to the chat window 
            let chatWindow = document.getElementById('chat_background');
            let messageContainer = chatWindow.querySelector('.message_container');
            if (!messageContainer) {
                messageContainer = document.createElement('div');
                messageContainer.classList.add('message_container');
                chatWindow.appendChild(messageContainer);
            }
            messageWrapper.appendChild(userMessageDiv);
            messageWrapper.appendChild(user_circle_div);


            messageContainer.appendChild(messageWrapper);
            messageContainer.scrollTop = messageContainer.scrollHeight;
 
            //generating chat from response
            let backendMessageDiv = document.createElement('div');
            backendMessageDiv.classList.add('backend_message');
            backendMessageDiv.textContent = message_from_backend;

            let backend_circle_div = document.createElement('div');
            backend_circle_div.classList.add('backend_circle');

            let messageWrapper2 = document.createElement('div');
            messageWrapper2.classList.add('backend_message_wrapper');

            messageWrapper2.appendChild(backend_circle_div);
            messageWrapper2.appendChild(backendMessageDiv);
            messageContainer.appendChild(messageWrapper2);
            messageContainer.scrollTop = messageContainer.scrollHeight;


        });
    })
    .catch(error => console.error('Error:', error));
}

/* ///   DELETE HISTORIE    /// */
function deletehistory(event){

    let season_id = event.target.id.split('_').pop();

    fetch('/api/delete-season', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'season_id=' + encodeURIComponent(season_id),
    })
    .then(response => response.text())
    .then(data => {
        let history_button = document.getElementById('Button_history_season_' + season_id);
        history_button.parentNode.removeChild(history_button);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

/* ///   ENTROVÁNÍ V PROMPT INPUTU    /// */
window.onload = function() {
    let textarea = document.getElementById('prompt_input');
    let button = document.getElementById('send_button');

    textarea.placeholder = "Ask Something...";

    textarea.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' && !event.shiftKey) {    
            event.preventDefault();
            button.click();
            textarea.value = ''
        }
    });
}
/* ///   NEW SEASSON BUTTN    /// */
document.getElementById('chat_new_seasson').addEventListener('click', function(){
    let elements = document.querySelectorAll('.backend_message_wrapper, .user_message_wrapper');
    for(let i=0; i<elements.length; i++){
        elements[i].parentNode.removeChild(elements[i]);
    }

    let name_input_element = document.getElementById('chat_season_name');
    let name_input = name_input_element.value;
    
    if(name_input == ''){
        name_input = 'New Season';
    }

    let history_div = document.getElementById('historie');
    let history_button = document.createElement('button');
    let delete_history_button = document.createElement('button');

    history_button.classList.add('history_button');
    delete_history_button.classList.add('delete_history')

    history_button.textContent = name_input
    delete_history_button.textContent = "\u2715";

    history_button.addEventListener('click', getChatHistory);
    delete_history_button.addEventListener('click', deletehistory);

    fetch('/new-season',{
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'name_history=' + encodeURIComponent(name_input),
    })
    .then(response => response.text())
    .then(data => {
        history_button.id = 'Button_history_season_' + data;
        delete_history_button.id = 'Button_delete_history_season_' + data;
    });

    name_input_element.value = ''
    history_button.appendChild(delete_history_button);
    history_div.appendChild(history_button);
})

