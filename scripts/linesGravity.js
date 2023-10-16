
// constants to calculate inital state
G = 6.67408 * Math.pow(10, -6) // modified to be to the power of -6 for ease
MAX_VEL = 100 // pxs^-1
MAX_MASS = 1000000000000000  // kg

// max allowed acceleration
MAX_ACC = 200 // pxs^-2

// change in time ( smaller slower | bigger faster )
dt = 8 // ms

alreadyDrawn = []

function pause() {
    paused = !paused
    console.log("unpaused/paused")
}

// todo:
// 1. add gravity of the cursor
// 2. each point has a color representing its mass
// 3. add a button to stabilize the points, set their velocities to 0
class Canvas {
    constructor() {

        // reference the canvas
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');

        // set the width of the canvas to the width of the window
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    static getInstance() {
        if (!Canvas.instance) {
            console.log("creating new instance of canvas")
            Canvas.instance = new Canvas();
          }
          return Canvas.instance;
    }

    drawLine(x1, y1, x2, y2, pressure, r=0, g=0, b=0) {

        // draw a line from x1, y1 to x2, y2
        this.ctx.beginPath();
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);

        // set the color
        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${pressure})`;

        // draw the line
        this.ctx.stroke();
    }

    refresh() {

        // remove all lines from the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}


class Point {
    constructor(id) {
        // set unique id for this point
        this.id = id

        // get instance of the canvas and cursor
        this.canvas = Canvas.getInstance()

        // the current position of the pixel
        this.posX = Math.random() * this.canvas.canvas.width
        this.posY = Math.random() * this.canvas.canvas.height

        // the velocity acting on the point in px/s
        this.velocityX = (Math.random() * MAX_VEL * 2) - MAX_VEL
        this.velocityY = (Math.random() * MAX_VEL * 2) - MAX_VEL

        // the acceleration acting on the point in m/s^2
        this.accelerationX = 0
        this.accelerationY = 0

        // the force acting on the point in N
        this.forceY = 0
        this.forceX = 0

        // the mass of the point in kg
        this.mass = Math.pow(Math.random()*10, parseInt(Math.random() * 16))

        // minimum distance between points
        this.minDistance = 250
    }

    /**
     * calculate the forces acting on this particle
     * TODO add gravity of the cursor to the 
     */
    calculateForces() {
        // resultant force
        let tmpForceX = 0
        let tmpForceY = 0

        let tmpPoints = [...points]

        // go over each point and calculate the force by this point
        for (let j = 0 ; j < tmpPoints.length ; j++) {

            // calculate distance between this point and the other point
            let dx = tmpPoints[j].posX - this.posX
            let dy = tmpPoints[j].posY - this.posY

            let xPositive = tmpPoints[j].posX - this.posX > 0 ? true : false
            let yPositive = tmpPoints[j].posY - this.posY > 0 ? true : false

            // check if distance is 0
            if (dx == 0 && dy == 0) {
                continue
            }

            // calculate the distance
            let distance = Math.sqrt((dx * dx) + (dy * dy))

            // only calculate the force if the distance is close enough
            if (distance < this.minDistance) {

                // calculate the angle 
                let angle = Math.atan(dx/dy)


                if (xPositive & yPositive) {
                    angle = Math.PI - angle
                }
                
                if (!xPositive & yPositive) {
                    angle = Math.PI + angle
                }

                if (!xPositive & !yPositive) {
                    angle = 2 * Math.PI - angle
                }
                
                // calculate the magnitude of the force
                let force = (G * this.mass * tmpPoints[j].mass) / (distance * distance)

                // split it up again into constituent forces
                let forceX = Math.sin(angle) * force
                let forceY= Math.cos(angle) * force

                // add the force to the resultant force, weird - and + because of the coordinate system
                if (xPositive & yPositive) {
                    tmpForceX += forceX
                    tmpForceY -= forceY
                } else if (!xPositive & yPositive) {
                    tmpForceX -= forceX
                    tmpForceY -= forceY
                } else if (!xPositive & !yPositive) {
                    tmpForceX += forceX
                    tmpForceY -= forceY
                } else {
                    tmpForceX -= forceX
                    tmpForceY -= forceY
                }
            }
        }

        // update the forces in one go
        this.forceX = tmpForceX
        this.forceY = tmpForceY
    }

    /**
     * calculate the acceleration from the current force being acted on this particle
     */
    calculateAcceleration() {
        
        // do the x component
        this.accelerationX = this.forceX / this.mass

        // do the y component
        this.accelerationY = this.forceY / this.mass

        let accelerationMagnitude = Math.sqrt(this.accelerationX * this.accelerationX + this.accelerationY * this.accelerationY)

        // check for max acceleration and set it to the max if it is
        if (accelerationMagnitude > MAX_ACC) {
            this.accelerationX = (this.accelerationX / accelerationMagnitude) * MAX_ACC
            this.accelerationY = (this.accelerationY / accelerationMagnitude) * MAX_ACC
        }
    }

    /**
     * Use suvat to calculate the new velocities
     */
    calculateVelocity() {

        // suvat equations
        // v = u + at

        // do suvat horizontally in the X direction
        let finalVelocityX = this.velocityX + this.accelerationX * (dt / 1000)
        
        // do suvat vertically in the Y direction
        let finalVelocityY = this.velocityY + this.accelerationY * (dt / 1000)

        // update the velocities
        this.velocityX = finalVelocityX
        this.velocityY = finalVelocityY
    }

    /**
     * use suvat to calculate the new position
     */
    calculateDisplacement() {

        // suvat equations
        // s = ut + 0.5at^2

        // do suvat horizontally in the X direction
        let displacementX = this.velocityX * (dt / 1000) + 0.5 * this.accelerationX * (dt / 1000) * (dt / 1000)

        // do suvat vertically in the Y direction
        let displacementY = this.velocityY * (dt / 1000) + 0.5 * this.accelerationY * (dt / 1000) * (dt / 1000)

        // if the jump is going to bring the point outside of bounds then perform the jump up to the edge and change direction
        if (this.posX + displacementX < 0) {
            this.posX = 1
            this.posY += displacementY

            // change the direction
            this.velocityX = -1 * this.velocityX

        } else if (this.posX + displacementX > this.canvas.canvas.width) {
            this.posX = this.canvas.canvas.width - 1
            this.posY += displacementY

            // change the direction
            this.velocityX = -1 * this.velocityX

        } else if (this.posY + displacementY < 0) {
            this.posX += displacementX
            this.posY = 1

            // change the direction
            this.velocityY = -1 * this.velocityY

        } else if (this.posY + displacementY > this.canvas.canvas.height) {
            this.posX += displacementX
            this.posY = this.canvas.canvas.height - 1

            // change the direction
            this.velocityY = -1 * this.velocityY

        } else {

            // update the position
            this.posX += displacementX
            this.posY += displacementY
        }
    }

    draw() {

        // for every other point that is close draw a line between them
        for (let i = 0 ; i < points.length ; i++) {

            // get the distance between the points
            let dx = Math.abs(points[i].posX - this.posX)
            let dy = Math.abs(points[i].posY - this.posY)
            let distance = Math.sqrt(dx * dx + dy * dy)

            // if the point is close to this point
            if (distance < this.minDistance) {

                // dont draw the line if already has been drawn
                if (alreadyDrawn.includes(this.id + points[i].id) || alreadyDrawn.includes(points[i].id + this.id)) {
                    continue
                }

                // draw a line between them
                this.canvas.drawLine(this.posX, this.posY, points[i].posX, points[i].posY, (0.25 - (distance/this.minDistance)/4), parseInt((this.mass/MAX_MASS) * 255), parseInt((points[i].mass/MAX_MASS) * 255), 0)
            }

            alreadyDrawn.push(this.id + points[i].id)
        }

        alreadyDrawn = []
    }

    calcMove() {
        // given, inital velocity, time and acceleration calculate the final velocity and position
        
        // first calculat new forces
        this.calculateForces()

        // calculate the acceleration
        this.calculateAcceleration()

        // calculate the velocity
        this.calculateVelocity()
        
        // calculate the displacement
        this.calculateDisplacement()
    }

    move() {

        // draw the lines
        this.draw()

        // normalise the force 
        let newForceX = this.forceX
        let newForceY = this.forceY

        // draw the force on the canvas in a red line
        // this.canvas.drawLine(this.posX, this.posY, this.posX + newForceX, this.posY + newForceY, 1, 255, 0, 0)
    }

    /**
     * debug the velocity of the point
     */
    velocityMagnitude() {
        console.log("velocity magnitude", Math.sqrt(this.velocityX * this.velocityX + this.velocityY * this.velocityY))
    }

    /**
     * debug the acceleration of the point
    */
    forceMagnitude() {
        console.log("force magnitude", Math.sqrt(this.forceX * this.forceX + this.forceY * this.forceY))
    }

}

// create points
points = []
numPoints = 40
let paused = false

// list of objects in the canvas
for (let i = 0; i < numPoints; i++) {
    points.push(new Point(i))
}

// create interval
interval = setInterval(function() {
    if (!paused) {

        // instance of canvas
        let canvas = Canvas.getInstance()

        // refresh the canvas
        canvas.refresh()

        // move the points
        for (let i = 0; i < points.length; i++) {
            points[i].calcMove()
        }

        for (let i = 0; i < points.length; i++) {
            points[i].move()
        }
    }
}, 50)