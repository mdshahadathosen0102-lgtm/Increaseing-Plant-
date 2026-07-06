const canvas = document.getElementById("webgl");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particlesArray;

// মাউসের পজিশন ট্র্যাক করার জন্য
let mouse = {
    x: null,
    y: null,
    radius: 150
}

window.addEventListener('mousemove', function(event) {
    mouse.x = event.x;
    mouse.y = event.y;
});

// পার্টিকেল তৈরি করার ক্লাস
class Particle {
    constructor(x, y, directionX, directionY, size, color) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
        this.color = color;
    }

    // পার্টিকেল আঁকার ফাংশন
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = '#00e5ff'; // থিমের নিয়ন সায়ান কালার
        ctx.fill();
    }

    // পার্টিকেলের মুভমেন্ট এবং বাউন্স চেক করার ফাংশন
    update() {
        if (this.x > canvas.width || this.x < 0) {
            this.directionX = -this.directionX;
        }
        if (this.y > canvas.height || this.y < 0) {
            this.directionY = -this.directionY;
        }

        // মাউসের সাথে ইন্টারেকশন (মাউস কাছে গেলে সরে যাবে)
        let dx = mouse.x - this.x;
        let dy = mouse.y - this.y;
        let distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < mouse.radius + this.size) {
            if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                this.x += 3;
            }
            if (mouse.x > this.x && this.x > this.size * 10) {
                this.x -= 3;
            }
            if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                this.y += 3;
            }
            if (mouse.y > this.y && this.y > this.size * 10) {
                this.y -= 3;
            }
        }
        this.x += this.directionX;
        this.y += this.directionY;
        this.draw();
    }
}

// স্ক্রিনের সাইজ অনুযায়ী পার্টিকেল তৈরি
function init() {
    particlesArray = [];
    let numberOfParticles = (canvas.height * canvas.width) / 12000;
    
    for (let i = 0; i < numberOfParticles; i++) {
        let size = (Math.random() * 2) + 1;
        let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
        let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
        let directionX = (Math.random() * 1.5) - 0.75;
        let directionY = (Math.random() * 1.5) - 0.75;
        let color = '#00e5ff';

        particlesArray.push(new Particle(x, y, directionX, directionY, size, color));
    }
}

// পার্টিকেলগুলোর মধ্যে লাইন কানেকশন তৈরি করা
function connect() {
    let opacityValue = 1;
    for (let a = 0; a < particlesArray.length; a++) {
        for (let b = a; b < particlesArray.length; b++) {
            let dx = particlesArray[a].x - particlesArray[b].x;
            let dy = particlesArray[a].y - particlesArray[b].y;
            let distance = dx * dx + dy * dy;
            
            if (distance < 15000) {
                opacityValue = 1 - (distance / 15000);
                ctx.strokeStyle = 'rgba(0, 229, 255,' + opacityValue + ')';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particlesArray[a].x, particlesArray[a].y);
                ctx.lineTo(particlesArray[b].x, particlesArray[b].y);
                ctx.stroke();
            }
        }
    }
}

// অ্যানিমেশন লুপ
function animate() {
    requestAnimationFrame(animate);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    
    for (let i = 0; i < particlesArray.length; i++) {
        particlesArray[i].update();
    }
    connect();
}

// স্ক্রিন রিসাইজ হলে ক্যানভাস মানিয়ে নেওয়া
window.addEventListener('resize', function() {
    canvas.width = innerWidth;
    canvas.height = innerHeight;
    init();
});

// মাউস স্ক্রিনের বাইরে গেলে ইন্টারেকশন বন্ধ করা
window.addEventListener('mouseout', function() {
    mouse.x = undefined;
    mouse.y = undefined;
});

init();
animate();
