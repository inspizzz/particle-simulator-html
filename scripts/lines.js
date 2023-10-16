// canvas contains points which move around in random directions
// lines are drawn between points which are close to each other

// TODO: add gravity mode



class Point {
    constructor() {

        // reference the canvas
        this.canvas = document.getElementById('canvas');
        this.ctx = canvas.getContext('2d');

        // set the width of the canvas to the width of the window
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        // random starting location
        this.x = Math.random() * this.canvas.width;
        this.y = Math.random() * this.canvas.height;

        console.log(this.x, this.y);

        // random direction in radians
        this.direction = Math.random() * 2 * Math.PI; 

        // uniform speed
        this.speed = 10

        // distance to join
        this.distance = 300;

        // remember lines to remove
        this.lines = [];

        this.gravity = false;
    }

    /**
     * move the point in the direction it is facing
     */
    move() {

        // calculate new position
        this.x += Math.cos(this.direction) * this.speed;
        this.y += Math.sin(this.direction) * this.speed;

        // bounce off the left and right edges
        if (this.x < 0 || this.x > this.canvas.width) {

            // change direction
            this.direction = Math.PI - this.direction;
        }

        // bounc off the top and bottom edges
        if (this.y < 0 || this.y > this.canvas.height) {

            // change direction
            this.direction = - this.direction;
        }
    }

    /**
     * draw the point on the canvas
     */
    draw() {
        

        // for every other point out there, if there is a point close to this one, draw a line
        for (var i = 0; i < points.length; i++) {

            // if the point is not this point
            if (points[i] != this) {

                // distances between points
                let dx = Math.abs(points[i].x - this.x)
                let dy = Math.abs(points[i].y - this.y)
                let distance = Math.sqrt(dx * dx + dy * dy);

                // if the point is close to this point
                if (distance < this.distance) {

                    // draw a line between the points
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.x, this.y);
                    this.ctx.lineTo(points[i].x, points[i].y);
                    // this.ctx.lineWidth = distance / 50;
                    this.ctx.strokeStyle = `rgba(0, 0, 0, ${1 - (distance/this.distance)})`;
                    this.ctx.stroke();


                }
            }
        }
    }

    refresh() {

        // remove all lines from the canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    toggleGravity() {
            
        // toggle gravity
        this.gravity = !this.gravity;
    }
}

// create 100 points
var points = [];
var numPoints = 100;

for (var i = 0; i < numPoints; i++) {
    let point = new Point();
    points.push(point);
}

// create interval
setInterval(function() {

    // refresh the canvas
    for (var i = 0; i < points.length; i++) {
        points[i].refresh();
    }

    // move the points
    for (var i = 0; i < points.length; i++) {
        points[i].move();
    }

    // draw the points
    for (var i = 0; i < points.length; i++) {
        points[i].draw();
    }
}, 30)

