document.addEventListener("DOMContentLoaded", function() {
    const recordButton = document.getElementById('recordButton');
    const speechRecognitionButton = document.getElementById('speechRecognitionButton');
    const audioPlayback = document.getElementById('audioPlayback');
    const outputDiv = document.getElementById('output');
    let mediaRecorder;
    let audioChunks = [];
    let isRecording = false;

    recordButton.addEventListener('click', function(e) {
        e.preventDefault();
        if (!isRecording) {
            startRecording();
        } else {
            stopRecording();
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
    }

    // Speech Recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    recognition.lang = 'en-US';

    speechRecognitionButton.addEventListener('click', () => {
        recognition.start();
        speechRecognitionButton.textContent = 'Listening...';
    });

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        outputDiv.textContent = transcript;
        speechRecognitionButton.textContent = 'Start Voice Input';
    };

    recognition.onend = () => {
        speechRecognitionButton.textContent = 'Start Voice Input';
    };
});

