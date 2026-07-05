# Increaseing-Plant-
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hand Gesture Flower AR</title>
    <!-- MediaPipe Scripts Loading -->
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
    
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background: #111;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: white;
            user-select: none;
        }
        #webcam {
            display: none;
        }
        #output_canvas {
            width: 100vw;
            height: 100vh;
            display: block;
        }
        #start-btn {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            padding: 15px 35px;
            font-size: 18px;
            font-weight: bold;
            background: linear-gradient(45deg, #ff4081, #e040fb);
            color: white;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            z-index: 10;
        }
    </style>
</head>
<body>

    <button id="start-btn">ক্যামেরা চালু করুন (Start)</button>
    <video id="webcam" autoplay playsinline></video>
    <canvas id="output_canvas"></canvas>

    <script>
        const video = document.getElementById('webcam');
        const canvas = document.getElementById('output_canvas');
        const ctx = canvas.getContext('2d');
        const startBtn = document.getElementById('start-btn');

        let bloomValue = 0.0;
        let growValue = 0.0;
        let windValue = 3.0;

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Initialize MediaPipe Hands
        const hands = new Hands({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
        });

        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 1,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });

        hands.onResults(onResults);

        function onResults(results) {
            ctx.save();
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Mirror image for realistic preview
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            if (results.image) {
                ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
            }
            ctx.restore(); // Restore context for normal text writing

            let leftHandPos = null;
            let rightHandPos = null;

            if (results.multiHandLandmarks && results.multiHandedness) {
                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    const handedness = results.multiHandedness[i].label; // 'Left' or 'Right'
                    
                    // Calculate distance between Thumb Tip (4) and Index Tip (8)
                    const p1 = landmarks[4];
                    const p2 = landmarks[8];
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    
                    // Normalize distance mapping to 0.0 - 1.0 range
                    let val = (dist - 0.03) / 0.20;
                    val = Math.max(0, Math.min(1, val));

                    // Get hand position in screen coordinates (Mirrored X)
                    const handX = (1 - landmarks[9].x) * canvas.width;
                    const handY = landmarks[9].y * canvas.height;

                    // MediaPipe tracks raw image, so we flip based on camera preview orientation
                    if (handedness === 'Right') { 
                        bloomValue = val;
                        leftHandPos = { x: handX, y: handY };
                    } else {
                        growValue = val;
                        rightHandPos = { x: handX, y: handY };
                    }
                }
            }

            // Small dynamic change in wind
            windValue = 2.0 + Math.sin(Date.now() * 0.003) * 1.5;

            // --- UI Overlays (Top Left) ---
            ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
            ctx.fillRect(15, 15, 140, 85);
            ctx.fillStyle = '#fff';
            ctx.font = '14px monospace';
            ctx.fillText(`Bloom: ${bloomValue.toFixed(2)}`, 25, 40);
            ctx.fillText(`Grow:  ${growValue.toFixed(2)}`, 25, 60);
            ctx.fillText(`Wind:  ${windValue.toFixed(2)}`, 25, 80);

            // --- Floating Labels Near Hands ---
            ctx.font = 'bold 12px Arial';
            if (leftHandPos) {
                ctx.fillStyle = 'rgba(255, 64, 129, 0.85)';
                ctx.fillRect(leftHandPos.x - 65, leftHandPos.y - 35, 130, 24);
                ctx.fillStyle = '#fff';
                ctx.fillText('Left Hand: Bloom', leftHandPos.x - 52, leftHandPos.y - 19);
            }
            if (rightHandPos) {
                ctx.fillStyle = 'rgba(0, 230, 118, 0.85)';
                ctx.fillRect(rightHandPos.x - 65, rightHandPos.y - 35, 130, 24);
                ctx.fillStyle = '#fff';
                ctx.fillText('Right Hand: Grow', rightHandPos.x - 52, rightHandPos.y - 19);
            }

            // Draw AR Flower
            drawFlower(growValue, bloomValue, windValue);
        }

        function drawFlower(grow, bloom, wind) {
            const baseX = canvas.width * 0.25; // Screen position (Left side)
            const baseY = canvas.height;
            const maxStemHeight = canvas.height * 0.55;
            const currentStemHeight = grow * maxStemHeight;
            
            if (currentStemHeight < 15) return;

            ctx.save();
            
            // Draw Stem (গাছের ডাল)
            ctx.strokeStyle = '#4CAF50';
            ctx.lineWidth = 7;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            
            const windOffset = Math.sin(Date.now() * 0.004) * wind * 18 * (currentStemHeight / maxStemHeight);
            const targetX = baseX + windOffset;
            const targetY = baseY - currentStemHeight;
            
            ctx.quadraticCurveTo(baseX + windOffset * 0.4, baseY - currentStemHeight * 0.5, targetX, targetY);
            ctx.stroke();

            // Leaves (পাতা)
            if (grow > 0.4) {
                ctx.fillStyle = '#388E3C';
                ctx.beginPath();
                ctx.ellipse(baseX + windOffset * 0.3 - 22, baseY - currentStemHeight * 0.3, 18, 9, -Math.PI/6, 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(baseX + windOffset * 0.6 + 22, baseY - currentStemHeight * 0.6, 18, 9, Math.PI/6, 0, Math.PI * 2);
                ctx.fill();
            }

            // Draw Flower Petals (ফুলের পাপড়ি)
            ctx.translate(targetX, targetY);
            const numPetals = 5;
            const maxPetalSize = 45;
            const petalSize = bloom * maxPetalSize;
            
            if (petalSize > 3) {
                ctx.fillStyle = '#FF4081'; // Pink color like video
                for (let i = 0; i < numPetals; i++) {
                    ctx.save();
                    ctx.rotate((i * 2 * Math.PI) / numPetals + (Date.now() * 0.001 * (wind * 0.04)));
                    ctx.beginPath();
                    ctx.ellipse(0, -petalSize / 1.8, petalSize / 2, petalSize, 0, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.restore();
                }
                
                // Yellow center (ফুলের মাঝখানের অংশ)
                ctx.fillStyle = '#FFEB3B';
                ctx.beginPath();
                ctx.arc(0, 0, Math.max(5, petalSize * 0.35), 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        }

        // Handle Camera Request on mobile via interaction
        startBtn.addEventListener('click', async () => {
            startBtn.style.display = 'none';
            const camera = new Camera(video, {
                onFrame: async () => {
                    await hands.send({image: video});
                },
                width: 640,
                height: 480,
                facingMode: 'user' // Front camera focus
            });
            camera.start().catch(err => {
                alert("ক্যামেরা অন হতে সমস্যা হচ্ছে: " + err);
                startBtn.style.display = 'block';
            });
        });
    </script>
</body>
</html>
