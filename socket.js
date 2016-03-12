function Socket(game) {
	var socket = io.connect("http://76.28.150.193:8888");

	socket.on("load", function (data) {
		game2 = JSON.parse(data.data);
		game.entities =[]
		game.Red.forEach(function(d){ d.removeFromWorld = true; });
		game.Red = [];
		for (var i = 0; i < game2.Red.length; i++) {			
			var Red2 = game2.Red[i];
			var red = new Red(game, Red2.radius, Red2.x, Red2.y, Red2.velocity);
			game.Red.push(red);
			game.addEntity(red);
		}
		game.Blue.forEach(function(d){ d.removeFromWorld = true; });
		game.Blue = [];
		for (var i = 0; i < game2.Blue.length; i++) {			
			var Blue2 = game2.Blue[i];
			var blue = new Blue(game, Blue2.radius, Blue2.x, Blue2.y, Blue2.velocity);
			game.Blue.push(blue);
			game.addEntity(blue);
		}
		game.rocks.forEach(function(d){ d.removeFromWorld = true; });
		game.rocks = [];
		for (var i = 0; i < game2.rocks.length; i++) {			
			var Rock2 = game2.rocks[i];
			var rock = new Rock(game, Rock2.radius, Rock2.x, Rock2.y, Rock2.velocity);
			game.rocks.push(rock);
			game.addEntity(rock);
		}
		
	});
	var stateInput = document.getElementById("state");
	var saveState = document.getElementById("save");
	var loadState = document.getElementById("load");
	
	saveState.onclick = function() {
		console.log(game);
		socket.emit("save", {
			studentname: "Todd Robbins",
			statename: stateInput.value,
			data: JSON.stringify(game, function(key, value) {
				if (key == 'game') { return "game"; }
				if(key == 'target' ) { return "target"; } 
				else { return value; }
			}),
		});
	}
	
	loadState.onclick = function() {
		socket.emit("load", {
			studentname: "Todd Robbins",
			statename: stateInput.value,
		});
	}
}