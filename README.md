<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Horizontal Beautiful AR Tree</title>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js" crossorigin="anonymous"></script>
    <script src="https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js" crossorigin="anonymous"></script>
    
    <style>
        body {
            margin: 0;
            overflow: hidden;
            background: #111;
            font-family: Arial, sans-serif;
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
            padding: 15px 40px;
            font-size: 18px;
            font-weight: bold;
            background: linear-gradient(45deg, #4CAF50, #008CBA);
            color: white;
            border: none;
            border-radius: 30px;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4);
            z-index: 10;
        }
    </style>
</head>
<body>

    <button id="start-btn">Camera Chalu Korun (Start)</button>
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
            
            // Mirror image for horizontal preview
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            if (results.image) {
                ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);
            }
            ctx.restore();

            if (results.multiHandLandmarks && results.multiHandedness) {
                for (let i = 0; i < results.multiHandLandmarks.length; i++) {
                    const landmarks = results.multiHandLandmarks[i];
                    const networkHand = results.multiHandedness[i].label; // 'Left' or 'Right'
                    
                    const p1 = landmarks[4];
                    const p2 = landmarks[8];
                    const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
                    
                    let val = (dist - 0.03) / 0.20;
                    val = Math.max(0, Math.min(1, val));

                    if (networkHand === 'Right') { 
                        bloomValue = val;
                    } else {
                        growValue = val;
                    }
                }
            }

            // Smooth wind animation
            windValue = 2.0 + Math.sin(Date.now() * 0.003) * 1.5;

            // Draw AR Flower Tree (All text overlay and labels are removed)
            drawBeautifulTree(growValue, bloomValue, windValue);
        }

        function drawBeautifulTree(grow, bloom, wind) {
            const baseX = canvas.width * 0.5; // Center position for horizontal view
            const baseY = canvas.height;
            const maxStemHeight = canvas.height * 0.75;
            const currentStemHeight = grow * maxStemHeight;
            
            if (currentStemHeight < 15) return;

            ctx.save();
            
            // Wind swaying effect physics
            const windOffset = Math.sin(Date.now() * 0.003) * wind * 25 * (currentStemHeight / maxStemHeight);
            const targetX = baseX + windOffset;
            const targetY = baseY - currentStemHeight;
            
            // --- Draw Main Elegant Trunk ---
            let gradient = ctx.createLinearGradient(baseX, baseY, targetX, targetY);
            gradient.addColorStop(0, '#1B5E20'); // Dark rich green base
            gradient.addColorStop(1, '#4CAF50'); // Bright vibrant green top
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 14 * (canvas.height / 720); // Scale based on screen size
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            
            ctx.beginPath();
            ctx.moveTo(baseX, baseY);
            
            let cp1x = baseX + windOffset * 0.3;
            let cp1y = baseY - currentStemHeight * 0.4;
            let cp2x = baseX + windOffset * 0.7;
            let cp2y = baseY - currentStemHeight * 0.7;
            
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, targetX, targetY);
            ctx.stroke();

            // Function to draw a beautiful flower with multiple petals
            function drawSingleFlower(fx, fy, scale) {
                ctx.save();
                ctx.translate(fx, fy);
                const numPetals = 6;
                const maxPetalSize = 35 * (canvas.height / 720);
                const petalSize = bloom * maxPetalSize * scale;
                
                if (petalSize > 2) {
                    // Soft glow for beautiful look
                    ctx.shadowBlur = 10;
                    ctx.shadowColor = '#FF1744';
                    
                    ctx.fillStyle = '#FF1744'; // Beautiful hot pink/red flowers
                    for (let i = 0; i < numPetals; i++) {
                        ctx.save();
                        ctx.rotate((i * 2 * Math.PI) / numPetals + (Date.now() * 0.0008));
                        ctx.beginPath();
                        ctx.ellipse(0, -petalSize / 1.5, petalSize / 2.2, petalSize, 0, 0, Math.PI * 2);
                        ctx.fill();
                        ctx.restore();
                    }
                    
                    // Golden Center Core
                    ctx.shadowBlur = 0;
                    ctx.fillStyle = '#FFD700';
                    ctx.beginPath();
                    ctx.arc(0, 0, petalSize * 0.35, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.restore();
            }

            // --- Multiple Branches & Flowers Generation ---
            
            // 1. Left Branch & Flower
            if (grow > 0.3) {
                ctx.strokeStyle = '#2E7D32';
                ctx.lineWidth = 8;
                ctx.beginPath();
                let b1StartX = baseX + windOffset * 0.4;
                let b1StartY = baseY - currentStemHeight * 0.4;
                let b1EndX = b1StartX - 70 * grow;
                let b1EndY = b1StartY - 40 * grow;
                ctx.moveTo(b1StartX, b1StartY);
                ctx.quadraticCurveTo(b1StartX - 35, b1StartY - 10, b1EndX, b1EndY);
                ctx.stroke();
                
                // Leaf on left branch
                ctx.fillStyle = '#81C784';
                ctx.beginPath();
                ctx.ellipse(b1EndX + 20, b1EndY + 10, 15, 7, Math.PI/4, 0, Math.PI*2);
                ctx.fill();
                
                drawSingleFlower(b1EndX, b1EndY, 0.8);
            }
            
            // 2. Right Branch & Flower
            if (grow > 0.55) {
                ctx.strokeStyle = '#2E7D32';
                ctx.lineWidth = 6;
                ctx.beginPath();
                let b2StartX = baseX + windOffset * 0.65;
                let b2StartY = baseY - currentStemHeight * 0.65;
                let b2EndX = b2StartX + 60 * grow;
                let b2EndY = b2StartY - 50 * grow;
                ctx.moveTo(b2StartX, b2StartY);
                ctx.quadraticCurveTo(b2StartX + 30, b2StartY - 15, b2EndX, b2EndY);
                ctx.stroke();
                
                // Leaf on right branch
                ctx.fillStyle = '#81C784';
                ctx.beginPath();
                ctx.ellipse(b2EndX - 20, b2EndY + 10, 15, 7, -Math.PI/4, 0, Math.PI*2);
                ctx.fill();

                drawSingleFlower(b2EndX, b2EndY, 0.75);
            }

            // 3. Middle Extra Branch & Flower
            if (grow > 0.7) {
                ctx.strokeStyle = '#2E7D32';
                ctx.lineWidth = 5;
                ctx.beginPath();
                let b3StartX = baseX + windOffset * 0.8;
                let b3StartY = baseY - currentStemHeight * 0.8;
                let b3EndX = b3StartX - 40 * grow;
                let b3EndY = b3StartY - 60 * grow;
                ctx.moveTo(b3StartX, b3StartY);
                ctx.quadraticCurveTo(b3StartX - 15, b3StartY - 30, b3EndX, b3EndY);
                ctx.stroke();

                drawSingleFlower(b3EndX, b3EndY, 0.7);
            }

            // 4. Main Top Flower
            drawSingleFlower(targetX, targetY, 1.2);
            
            ctx.restore();
        }

        // Camera Initialization optimized for Horizontal/Landscape View
        startBtn.addEventListener('click', async () => {
            startBtn.style.display = 'none';
            const camera = new Camera(video, {
                onFrame: async () => {
                    await hands.send({image: video});
                },
                width: 1280, // Widescreen resolution
                height: 720,
                facingMode: 'user'
            });
            camera.start().catch(err => {
                alert("Camera access error: " + err);
                startBtn.style.display = 'block';
            });
        });
    </script>
</body>
</html>
