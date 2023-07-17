var canvas = document.querySelector('canvas');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var c = canvas.getContext('2d');

var mouse = {
    x: innerWidth / 2,
    y: innerHeight / 2
}

var particles
var particlesAmount = 300
var radius = 15
var mass = 1

var colors = [
    "blue",
    "purple",
    "red",
    "darkorange",
    "cyan",
    "hotpink"
]

// Add a mouse move listener to the canvas
canvas.addEventListener('mousemove', function(event){
    mouse.x = event.x;
    mouse.y = event.y;
})

addEventListener('resize', function(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
})

addEventListener('click', function(){
    init()
})


function randomIntFromRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  
function randomColor(colors) {
    return colors[Math.floor(Math.random() * colors.length)]
}

// A function to apply the pythagoras theorm to find the
// distance between two objects
function getDistance(x1, y1, x2, y2) {
    const xDist = x2 - x1
    const yDist = y2 - y1

    return Math.sqrt(Math.pow(xDist, 2) + Math.pow(yDist, 2))
}

/**
 * Rotates coordinate system for velocities
 *
 * Takes velocities and alters them as if the coordinate system they're on was rotated
 *
 * @param  Object | velocity | The velocity of an individual particle
 * @param  Float  | angle    | The angle of collision between two objects in radians
 * @return Object | The altered x and y velocities after the coordinate system has been rotated
 */
  
function rotate(velocity, angle) {
    const rotatedVelocities = {
        x: velocity.x * Math.cos(angle) - velocity.y * Math.sin(angle),
        y: velocity.x * Math.sin(angle) + velocity.y * Math.cos(angle)
    };

    return rotatedVelocities;
}

/**
 * Swaps out two colliding particles' x and y velocities after running through
 * an elastic collision reaction equation
 *
 * @param  Object | particle      | A particle object with x and y coordinates, plus velocity
 * @param  Object | otherParticle | A particle object with x and y coordinates, plus velocity
 * @return Null | Does not return a value
 */

function resolveCollision(particle, otherParticle) {
    const xVelocityDiff = particle.velocity.x - otherParticle.velocity.x;
    const yVelocityDiff = particle.velocity.y - otherParticle.velocity.y;

    const xDist = otherParticle.x - particle.x;
    const yDist = otherParticle.y - particle.y;

    // Prevent accidental overlap of particles
    if (xVelocityDiff * xDist + yVelocityDiff * yDist >= 0) {

        // Grab angle between the two colliding particles
        const angle = -Math.atan2(otherParticle.y - particle.y, otherParticle.x - particle.x);

        // Store mass in var for better readability in collision equation
        const m1 = particle.mass;
        const m2 = otherParticle.mass;

        // Velocity before equation
        const u1 = rotate(particle.velocity, angle);
        const u2 = rotate(otherParticle.velocity, angle);

        // Velocity after 1d collision equation
        const v1 = { x: u1.x * (m1 - m2) / (m1 + m2) + u2.x * 2 * m2 / (m1 + m2), y: u1.y };
        const v2 = { x: u2.x * (m1 - m2) / (m1 + m2) + u1.x * 2 * m2 / (m1 + m2), y: u2.y };

        // Final velocity after rotating axis back to original location
        const vFinal1 = rotate(v1, -angle);
        const vFinal2 = rotate(v2, -angle);

        // Swap particle velocities for realistic bounce effect
        particle.velocity.x = vFinal1.x;
        particle.velocity.y = vFinal1.y;

        otherParticle.velocity.x = vFinal2.x;
        otherParticle.velocity.y = vFinal2.y;
    }
}

function Particle(x, y, color){
    this.x = x
    this.y = y
    this.velocity = { 
        x: randomIntFromRange(-1, 1),
        y: randomIntFromRange(-1, 1)
    }
    this.color = color
    this.mass = mass
    this.opacity = 0
    this.draw = function(){
        c.beginPath();
        c.arc(this.x, this.y, radius, 0, Math.PI * 2, false);
        c.save()
        c.globalAlpha = this.opacity;
        c.fillStyle = this.color;
        c.fill()
        c.restore()
        c.strokeStyle = this.color;
        c.stroke();
        c.closePath()
    }
    this.update = particles => {
        // This is gonna draw a new circle with every function call
        this.draw()

        for (let i = 0; i < particles.length; i++) {
            if (this === particles[i]) continue;
            if (getDistance(this.x, this.y, particles[i].x, particles[i].y) - radius * 2 <= 0){
                resolveCollision(this, particles[i]);
            }
        }

        if (this.x + radius > canvas.width || this.x - radius < 0){
            this.velocity.x = -this.velocity.x
        }

        if (this.y + radius > canvas.height || this.y - radius < 0){
            this.velocity.y = -this.velocity.y
        }

        // Interactivity
        if (getDistance(mouse.x, mouse.y, this.x, this.y) < 100 && this.opacity < 0.3){
            this.opacity += 0.02
        }
        else if (this.opacity > 0){
            this.opacity -= 0.02
            this.opacity = Math.max(0, this.opacity)
        }

        this.x += this.velocity.x
        this.y += this.velocity.y
    
    }
}

function init(){
    particles = [];

    for (let i = 0; i < particlesAmount; i++){
        var x = randomIntFromRange(0 + radius, canvas.width - radius);
        var y = randomIntFromRange(0 + radius, canvas.height - radius);
        var color = randomColor(colors)

        if (i > 0){
            for (let j = 0; j < particles.length; j++){
                if (getDistance(x, y, particles[j].x, particles[j].y) - radius * 2 < 0){
                    x = randomIntFromRange(0 + radius, canvas.width - radius)
                    y = randomIntFromRange(0 + radius, canvas.height - radius);
                    j = -1
                }
            }
        }
        particles.push( new Particle(x, y, color))
    }
}

function animate(){
    requestAnimationFrame(animate);
    c.clearRect(0, 0, innerWidth, innerHeight);
    
    particles.forEach(particle => {
        particle.update(particles)
    })
}

init()
animate()
