const video = document.getElementById('video'); // Get the video element created for catching face

Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'), // Load the face detector model from the models folder
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'), // Detects different parts of the face (eyes, nose, mouth)
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'), // Recognizes where the face is (box around it)
    faceapi.nets.faceExpressionNet.loadFromUri('/models') // Detects expressions
]).then(startVideo); // Once loaded, call the startVideo function

function startVideo() {
    navigator.mediaDevices.getUserMedia({ video: true }) // Method that asks for permission (camera) - video input here
        .then(stream => { // If access is given, the video stream object from the camera
            video.srcObject = stream; // Sets the source of the video element to the camera stream (so that video is displayed on screen)
        })
        .catch(err => { // If there's an error accessing the camera
            console.error("Error accessing the camera: ", err);
        });
}

video.addEventListener('play', () => { // Whenever the video plays, this function runs
    const canvas = faceapi.createCanvasFromMedia(video); //creates canvas element matching the dimensions of video(taki uska upar barabar aye) to draw the detections on
    document.getElementById('video-container').append(canvas); //video ka upar add this canvas of detections
    const displaySize = { width: video.width, height: video.height }; //sets canvas dimensions same as video dimensions
    faceapi.matchDimensions(canvas, displaySize); //matches canvas and video dimensions

    setInterval(async () => { // Repeatedly detect(call these func) every 100ms (response received is async)
        const detections = await faceapi.detectAllFaces(video, // Detect all faces in the video element
            new faceapi.TinyFaceDetectorOptions()) // The model you're using to detect faces (here, tiny face) and its options (here, () default)
            .withFaceLandmarks() // Detect different dots/landmarks of our face
            .withFaceExpressions(); // Detect all expressions of detected faces
        
        const resizedDetections = faceapi.resizeResults(detections, displaySize);//resizeResults function adjusts the coordinates and sizes of the detected faces, landmarks, and expressions to match the specified displaySize
        
        // Clear the canvas before drawing the new detections
        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw the various aspects of face detection on canvas
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
    }, 100);
});
