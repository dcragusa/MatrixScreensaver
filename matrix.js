// charset
var matrixcode = "abcdefghijklmnopqrstuvwxyz012345678989$+-*/=%\x22#&_(),.;:?!\|{}<>[]^~\x27";
matrixcode = matrixcode.split("");

// spacing around chars
var horsize = 11;
var versize = 18;

// density of columns
var density = 5;

function sleep(time) {
	return new Promise((resolve) => setTimeout(resolve, time));
}

function randInt(max) {
	return Math.floor(Math.random() * max);
}

class Column {

	// generate new set of random chars
	newchars(vsize) {
		this.chars = [];
		for (var i = 0; i < vsize; i++) {
			this.chars.push(matrixcode[randInt(matrixcode.length)]);
		}
	}

	constructor(vsize, numcols) {

		this.newchars(vsize);

		// mostly at same speed: occasional slow ones
		if (!randInt(4))
			this.speed = 1;
		else
			this.speed = 0;

		// random start off screen
		this.delay = randInt(numcols * density);

		this.position = 0;
	}
};

document.addEventListener("DOMContentLoaded", function() {

	var c = document.getElementById("c");
	var ctx = c.getContext("2d");

	function output(text, horpos, verpos) {
		ctx.fillText(text, horpos, verpos);
	}

	function erase(horpos, verpos) {
		ctx.clearRect(horpos, verpos, horsize, versize);
	}

	function intro() {

		// can't wait for the 'await' function...
		var text = "Wake up, Neo...".split("");
		renderIntro(text, 0).then(function(value) {
			if (value) {
				sleep(2000).then(() => {
					ctx.clearRect(0, 0, c.width, c.height);
					text = "The Matrix has you...".split("");
					renderIntro(text, 0).then(function(value) {
						if (value) {
							sleep(2000).then(() => {
								window.addEventListener('resize', resizeCanvas, false);
								resizeCanvas();
								window.setInterval(draw, 40);
							});
						}
					});
				});
			}
		})
	}

	function renderIntro(text, i) {

		// random intro speeds
		if (!randInt(3))
			var sleepTime = 150
		else
			var sleepTime = 300

		ctx.font = "22px matrix_courier";
		ctx.fillStyle = "#7bff8d";

		return sleep(sleepTime).then(() => {
			output(text[i], (i * 13) + 30, 40)
			if (i < text.length - 1) {
				i++;
				return renderIntro(text, i);
			} else {
				return true;
			}
		})
	}

	// set up appropriate no. of columns
	function resizeCanvas() {

		c.width = window.innerWidth;
		c.height = window.innerHeight;

		numcols = (c.width / horsize) + 1;  // add 1 for safety
		vchars = Math.floor(c.height / versize) + 1;

		columns = [];
		for (var i=0; i < numcols; i++)
			columns.push(new Column(vchars, numcols));
	}



	// drawing the characters
	function draw() {

		ctx.font = "20px matrix_code";

		for (var i=0; i < columns.length; i++) {

			var col = columns[i];

			if (!col.delay) {

				for (var j=0; j < vchars; j++) {

					var text = col.chars[j];
					var horpos = i * horsize
					var verpos = j * versize
					var verout = verpos + versize  // zero-indexed!

					// different styles: first chars are whiter
					if (j == col.position) {
						erase(horpos, verpos);
						ctx.fillStyle = "#f6f6f4";
						output(text, horpos, verout);

					} else if (j == col.position - 1) {
						erase(horpos, verpos);
						ctx.fillStyle = "#c9cfb9";
						output(text, horpos, verout);

					} else if (j == col.position - 2) {
						erase(horpos, verpos);
						ctx.fillStyle = "#95a297";
						output(text, horpos, verout);

					// the rest of the chars are this colour
					} else if (j == col.position - 3) {
						erase(horpos, verpos);
						ctx.fillStyle = "#2cb231";
						output(text, horpos, verout);

					// chars not whiter or fading have a chance of switching
					} else if (j < col.position - 3 && j >= (col.position - vchars) + 10) {

						if (!randInt(15)) {
							text = matrixcode[randInt(matrixcode.length)];
							erase(horpos, verpos);
							ctx.fillStyle = "#2cb231";
							output(text, horpos, verout);
						}

					// gradually fade out chars once column has passed by
					} else if (j < (col.position - vchars) + 10 && j > col.position - vchars - 10) {

						// random fading
						if (!randInt(5))
							ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
						else
							ctx.fillStyle = "rgba(0, 0, 0, 0.05)";

						ctx.fillRect(i * horsize, j * versize, horsize, versize);

					// definitely clear by this point
					} else if (j == col.position - vchars - 10)
						erase(horpos, verpos);
				}

				col.delay = col.speed;
				col.position++;

			} else
				col.delay--;

			// once column is completely off screen: assign a
			// random delay, regenerate contents, and send to top
			if (col.position > (vchars * 2) + 15) {
				col.newchars(vchars);
				col.position = 0;
				col.delay = randInt(numcols * density);
			}

		}
	}

	// kick off after delay
	sleep(1000).then(() => {
		intro();
	});
});
