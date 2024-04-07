document.addEventListener("DOMContentLoaded", function() {
    const recordButton = document.getElementById('recordButton');
    const audioPlayback = document.getElementById('audioPlayback');
    const outputDiv = document.getElementById('output');
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recordButton.addEventListener('click', function() {
        if (!isRecording) {
            startRecording();
            recognition.start();
        } else {
            stopRecording();
            recognition.stop();
        }
    });

    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function(stream) {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                isRecording = true;
                recordButton.textContent = "Stop Recording";
                recordButton.classList.add("recording");

                mediaRecorder.ondataavailable = function(event) {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = function() {
                    const audioBlob = new Blob(audioChunks, { 'type' : 'audio/ogg; codecs=opus' });
                    audioChunks = [];
                    const audioUrl = URL.createObjectURL(audioBlob);
                    audioPlayback.src = audioUrl;
                    isRecording = false;
                    recordButton.textContent = "Start Recording";
                    recordButton.classList.remove("recording");
                };
            })
            .catch(function(err) {
                console.error("The following error occurred: " + err);
            });
    }

    function stopRecording() {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        dump(finalTranscript, '/Users/prn/Documents/NoteStream/finalTranscript.json');
    }


    let finalTranscript = '';
    recognition.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        
        outputDiv.textContent = finalTranscript + interimTranscript;
    };    

    recognition.onstart = () => {
        outputDiv.textContent = 'Listening... ';
    };

    recognition.onend = () => {
        recordButton.textContent = 'Start Recording';
    };

    const fs = require('fs');

    function dump(jsonObject, filePath) {
        try {
            const jsonString = JSON.stringify(jsonObject, null, 2);
            fs.writeFileSync(filePath, jsonString, 'utf8');
            console.log("File saved successfully.");
        } catch (error) {
            console.error("Failed to save the file:", error);
        }
    }

    function load(filePath) {
        const jsonString = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(jsonString);
    }
});


