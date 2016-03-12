/* 
      Last man standing.  Agents must aim and shoot one another and dodge bullets  if they can.
*/
function distance(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

function direction(a, b) {
    var dx = a.x - b.x;
    var dy = a.y - b.y;
    var dist = Math.sqrt(dx * dx + dy * dy);
    if(dist > 0) return { x: dx / dist, y: dy / dist }; else return {x:0,y:0};
}
// rocks for eliminating other team 
function Rock(game, radius, x, y, velocity) {
 //   this.player = 1;
    this.radius = radius || 4;
    this.name = "Rock";
    this.color = "Gray";
    this.maxSpeed = 200;
    this.thrown = false;
	Entity.call(this, game, x || rockPositionX, y || rockPositionY);

    this.velocity = velocity || { x: 0, y: 0 };

};

Rock.prototype = new Entity();
Rock.prototype.constructor = Rock;

Rock.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
	
};

Rock.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Rock.prototype.collideRight = function () {
    return (this.x + this.radius) > 600;
};

Rock.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Rock.prototype.collideBottom = function () {
    return (this.y + this.radius) > 330;
};

Rock.prototype.update = function () {
    Entity.prototype.update.call(this);
    //  console.log(this.velocity);

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 600 - this.radius;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.x = 0;
        this.velocity.y = 0;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 330 - this.radius;
    }

    var chasing = false;
    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && ent.name === "Rock" && this.thrown && ent.thrown && this.collide(ent)) {
            var temp = { x: this.velocity.x, y: this.velocity.y };

            var dist = distance(this, ent);
            var delta = this.radius + ent.radius - dist;
            var difX = (this.x - ent.x) / dist;
            var difY = (this.y - ent.y) / dist;

            this.x += difX * delta / 2;
            this.y += difY * delta / 2;
            ent.x -= difX * delta / 2;
            ent.y -= difY * delta / 2;

            this.velocity.x = ent.velocity.x * friction;
            this.velocity.y = ent.velocity.y * friction;
            ent.velocity.x = temp.x * friction;
            ent.velocity.y = temp.y * friction;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
            ent.x += ent.velocity.x * this.game.clockTick;
            ent.y += ent.velocity.y * this.game.clockTick;
        }
    }

    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > this.maxSpeed) {
        var ratio = this.maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
	
	
};

Rock.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();

};

// only change code in selectAction function()

function Blue(game, radius, x, y, velocity) {
    this.player = 1;
    this.radius = radius || 10;
    this.rocks = 0;
    this.kills = 0;
    this.name = "Blue";
    this.color = "Blue";
    this.cooldown = 0;
    Entity.call(this, game, x || bluePositionX, y || bluePositionY);
	this.velocity = velocity || { x: 0, y: 0 };
};

Blue.prototype = new Entity();
Blue.prototype.constructor = Blue;

// alter the code in this function to create your agent
// you may check the state but do not change the state of these variables:
//    this.rocks
//    this.cooldown
//    this.x
//    this.y
//    this.velocity
//    this.game and any of its properties

// you may access a list of Red from this.game.Red
// you may access a list of rocks from this.game.rocks
// you may access a list of players from this.game.players
Blue.prototype.selectAction = function () {
	
    var action = { direction: { x: 0, y: 0 }, throwRock: false, target: null};
    var acceleration = 1000000;
    var closest = 1000;
    var target = null;
    this.visualRadius = 500;

    for (var i = 0; i < this.game.Red.length; i++) {
        var ent = this.game.Red[i];
        var dist = distance(ent, this);
        if (dist < closest) {
            closest = dist;
            target = ent;
        }
        if (this.collide({x: ent.x, y: ent.y, radius: this.visualRadius})) {
            var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
            action.direction.x -= difX * acceleration / (dist * dist);
            action.direction.y -= difY * acceleration / (dist * dist);
        }
    }
    for (var i = 0; i < this.game.rocks.length; i++) {
        var ent = this.game.rocks[i];
        if (!ent.removeFromWorld && !ent.thrown && this.rocks < 2 && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                action.direction.x += difX * acceleration / (dist * dist);
                action.direction.y += difY * acceleration / (dist * dist);
            }
        }
    }

    if (target) {
        action.target = target;
        action.throwRock = true;
    }
    return action;
};

// do not change code beyond this point

Blue.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Blue.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Blue.prototype.collideRight = function () {
    return (this.x + this.radius) > 600;
};

Blue.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Blue.prototype.collideBottom = function () {
    return (this.y + this.radius) > 330;
};

Blue.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;
    this.action = this.selectAction();
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;
	
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 600 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 330 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name !== "Red" && ent.name !== "Rock") {
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name === "Rock" && this.rocks < 2 && ent.thrown === false) {
                this.rocks++;
                ent.removeFromWorld = true;
            }
			if (ent.name === "Rock" && ent.thrown && !ent.collideBottom() && !ent.collideLeft() && !ent.collideRight() && !ent.collideTop()) {
                this.removeFromWorld = true;
                ent.thrown = false;
				ent.velocity.x = 0;
                ent.velocity.y = 0;
          //      ent.throwerRED.kills++;
            } 
			//if(ent.name === "Rock" && ent.velocity.x === 0 && ent.velocity.y === 0) {
			//	this.removeFromWorld = false;
			//}
        }
    }
    

    if (this.cooldown === 0 && this.action.throwRock && this.rocks > 0) {
        this.cooldown = 1;
        this.rocks--;
        var target = this.action.target;
        var dir = direction(target, this);

        var rock = new Rock(this.game);
        rock.x = this.x + dir.x * (this.radius + rock.radius + 20);
        rock.y = this.y + dir.y * (this.radius + rock.radius + 20);
        rock.velocity.x = dir.x * rock.maxSpeed;
        rock.velocity.y = dir.y * rock.maxSpeed;
        rock.thrown = true;
        rock.throwerBLUE = this;
        this.game.addEntity(rock);
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Blue.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};
// find and replace Red with your initials (i.e. ABC)
// change this.name = "Your Chosen Name"

// only change code in selectAction function()

function Red(game, radius, x, y, velocity) {
    this.player = 1;
    this.radius = radius || 10;
    this.rocks = 0;
    this.kills = 0;
    this.name = "Red";
    this.color = "Red";
    this.cooldown = 0;
    Entity.call(this, game, x || redPositionX, y || redPositionY);
	this.velocity = velocity || { x: 0, y: 0 };
};

Red.prototype = new Entity();
Red.prototype.constructor = Red;

// alter the code in this function to create your agent
// you may check the state but do not change the state of these variables:
//    this.rocks
//    this.cooldown
//    this.x
//    this.y
//    this.velocity
//    this.game and any of its properties

// you may access a list of Blue from this.game.Blue
// you may access a list of rocks from this.game.rocks
// you may access a list of players from this.game.players
Red.prototype.selectAction = function () {
	
    var action = { direction: { x: 0, y: 0 }, throwRock: false, target: null};
    var acceleration = 1000000;
    var closest = 1000;
    var target = null;
    this.visualRadius = 500;

    for (var i = 0; i < this.game.Blue.length; i++) {
        var ent = this.game.Blue[i];
        var dist = distance(ent, this);
        if (dist < closest) {
            closest = dist;
            target = ent;
        }
        if (this.collide({x: ent.x, y: ent.y, radius: this.visualRadius})) {
            var difX = (ent.x - this.x) / dist;
            var difY = (ent.y - this.y) / dist;
            action.direction.x -= difX * acceleration / (dist * dist);
            action.direction.y -= difY * acceleration / (dist * dist);
        }
    }
    for (var i = 0; i < this.game.rocks.length; i++) {
        var ent = this.game.rocks[i];
        if (!ent.removeFromWorld && !ent.thrown && this.rocks < 2 && this.collide({ x: ent.x, y: ent.y, radius: this.visualRadius })) {
            var dist = distance(this, ent);
            if (dist > this.radius + ent.radius) {
                var difX = (ent.x - this.x) / dist;
                var difY = (ent.y - this.y) / dist;
                action.direction.x += difX * acceleration / (dist * dist);
                action.direction.y += difY * acceleration / (dist * dist);
            }
        }
    }

    if (target) {
        action.target = target;
        action.throwRock = true;
    }
    return action;
};

// do not change code beyond this point

Red.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

Red.prototype.collideLeft = function () {
    return (this.x - this.radius) < 0;
};

Red.prototype.collideRight = function () {
    return (this.x + this.radius) > 600;
};

Red.prototype.collideTop = function () {
    return (this.y - this.radius) < 0;
};

Red.prototype.collideBottom = function () {
    return (this.y + this.radius) > 330;
};

Red.prototype.update = function () {
    Entity.prototype.update.call(this);
    // console.log(this.velocity);
    if (this.cooldown > 0) this.cooldown -= this.game.clockTick;
    if (this.cooldown < 0) this.cooldown = 0;
    this.action = this.selectAction();
    this.velocity.x += this.action.direction.x;
    this.velocity.y += this.action.direction.y;
	
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }

    this.x += this.velocity.x * this.game.clockTick;
    this.y += this.velocity.y * this.game.clockTick;

    if (this.collideLeft() || this.collideRight()) {
        this.velocity.x = -this.velocity.x * friction;
        if (this.collideLeft()) this.x = this.radius;
        if (this.collideRight()) this.x = 600 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    if (this.collideTop() || this.collideBottom()) {
        this.velocity.y = -this.velocity.y * friction;
        if (this.collideTop()) this.y = this.radius;
        if (this.collideBottom()) this.y = 330 - this.radius;
        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;
    }

    for (var i = 0; i < this.game.entities.length; i++) {
        var ent = this.game.entities[i];
        if (ent !== this && this.collide(ent)) {
            if (ent.name !== "Blue" && ent.name !== "Rock") {
                var temp = { x: this.velocity.x, y: this.velocity.y };
                var dist = distance(this, ent);
                var delta = this.radius + ent.radius - dist;
                var difX = (this.x - ent.x) / dist;
                var difY = (this.y - ent.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                ent.x -= difX * delta / 2;
                ent.y -= difY * delta / 2;

                this.velocity.x = ent.velocity.x * friction;
                this.velocity.y = ent.velocity.y * friction;
                ent.velocity.x = temp.x * friction;
                ent.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                ent.x += ent.velocity.x * this.game.clockTick;
                ent.y += ent.velocity.y * this.game.clockTick;
            }
            if (ent.name === "Rock" && this.rocks < 2 && ent.thrown === false) {
                this.rocks++;
                ent.removeFromWorld = true;
            }
			if (ent.name === "Rock" && ent.thrown) {
                this.removeFromWorld = true;
                ent.thrown = false;
				ent.velocity.x = 0;
                ent.velocity.y = 0;
          //      ent.throwerRED.kills++;
            } 
        }
    }
    

    if (this.cooldown === 0 && this.action.throwRock && this.rocks > 0) {
        this.cooldown = 1;
        this.rocks--;
        var target = this.action.target;
        var dir = direction(target, this);

        var rock = new Rock(this.game);
        rock.x = this.x + dir.x * (this.radius + rock.radius + 20);
        rock.y = this.y + dir.y * (this.radius + rock.radius + 20);
        rock.velocity.x = dir.x * rock.maxSpeed;
        rock.velocity.y = dir.y * rock.maxSpeed;
        rock.thrown = true;
        rock.throwerRED = this;
        this.game.addEntity(rock);
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Red.prototype.draw = function (ctx) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill();
    ctx.closePath();
};

var friction = 1;
var maxSpeed = 100;

var numRocks = 5;
var rockCounter = 0; 
var rockPositionX = 0; 
var rockPositiony = 0; 
var numBlue = 5;
var bluePositionX = 0; 
var bluePositionY = 0; 
var numRed = 5;
var redPositionX = 0; 
var redPositionY = 0; 


window.onload = function () {
    var canvas = document.getElementById('gameWorld');
    var ctx = canvas.getContext('2d');


    gameEngine = new GameEngine();

	for (var j = 0; j <numBlue; j++) {
	if (j==0){
		bluePositionX = 0; 
		bluePositionY = 50; 
	} else if (j == 2) {
		bluePositionX = 0; 
		bluePositionY = 100; 
	}
	else if (j == 4) {
		bluePositionX = 0; 
		bluePositionY = 150; 
	}
	else if (j == 3) {
		bluePositionX = 0; 
		bluePositionY = 200; 
	}
	else if (j == 1) {
		bluePositionX = 0; 
		bluePositionY = 250; 
	}
	var blue = new Blue(gameEngine);
	gameEngine.addEntity(blue);
	}
	for (var k = 0; k < numRed; k++) {
	if (k==0){
		redPositionX = 600; 
		redPositionY = 50; 
	} else if (k == 2) {
		redPositionX = 600; 
		redPositionY = 100; 
	} else if (k == 4) {
		redPositionX = 600; 
		redPositionY = 150; 
	} else if (k == 3) {
		redPositionX = 600; 
		redPositionY = 200; 
	} else if (k == 1) {
		redPositionX = 600; 
		redPositionY = 250; 
	}
	var red = new Red(gameEngine);
	gameEngine.addEntity(red);
	}
	for (var i = 0; i < numRocks; i++) {
	    if (i == 1) {
		rockPositionX = 300; 
		rockPositionY = Math.random() * 100; 
		}
		if (i == 3) {
		rockPositionX = 300; 
		rockPositionY = Math.random() * 150; 
		}
		if (i == 0) {
		rockPositionX = 300; 
		rockPositionY = Math.random() * 200; 
		}
		if (i == 2) {
		rockPositionX = 300; 
		rockPositionY = Math.random() * 250; 
		}
		if (i == 4) {
		rockPositionX = 300; 
		rockPositionY = Math.random() * 300; 
		}
		var rock = new Rock(gameEngine); 
		gameEngine.addEntity(rock); 
	}
	gameEngine.init(ctx); 
	gameEngine.start(); 
 	Socket(gameEngine); 
}