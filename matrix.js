// charset
const matrixAlphabet = "abcdefghijklmnopqrstuvwxyz123456789890~!#$%^&*()-_=+[]{};:\'\",.<>/?\\|".split("");

// spacing around chars
const horsize = 11;
const versize = 19;

// rain density - lower the better
const rainDensity = 4;

function sleep(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function randInt(max) {
  return Math.floor(Math.random() * max);
}


class Column {

  constructor(numChars, numCols) {
    // fill column with chars
    this.setChars(numChars);
    // random start off screen
    this.delay = randInt(numCols * rainDensity * 2);
    // mostly at same speed: occasional slow ones
    this.speed = !randInt(4) ? 1 : 0;
    // position at top of screen
    this.position = 0;
  }

  setChars(numChars) {
    // generate new set of random chars
    this.chars = [];
    for (let i = 0; i < numChars; i++) {
      this.chars.push(matrixAlphabet[randInt(matrixAlphabet.length)]);
    }
  }

}


class Context {

  constructor() {
    this.c = document.getElementById("c");
    this.ctx = this.c.getContext("2d");
  }

  outputChar(char, horpos, verpos) {
    this.ctx.fillText(char, horpos, verpos);
  }

  clearChar(horpos, verpos) {
    this.ctx.clearRect(horpos, verpos, horsize, versize);
  }

  clearScreen() {
    this.ctx.clearRect(0, 0, this.c.width, this.c.height);
  }

  async renderIntro(text, i) {
    // sleep a random amount of time
    await sleep(!randInt(3) ? 100 : 300);
    // output char, fixed offset of 30 horizontal, 40 vertical
    this.outputChar(text[i], (i * (horsize + 2)) + 30, 40);
    // return when done, otherwise output next character
    return i === text.length - 1 ? true : this.renderIntro(text, i + 1);
  }

  async intro() {
    // set font, colour and initial sleep
    this.ctx.font = "22px matrix_courier";
    this.ctx.fillStyle = "#7bff8d";
    await sleep(500);

    // first line
    await this.renderIntro("Wake up, Neo...".split(""), 0);
    await sleep(2000);
    this.clearScreen();

    // second line
    await this.renderIntro("The Matrix has you...".split(""), 0);
    await sleep(2000);
    this.clearScreen();
  }

  setupCanvas() {
    // set canvas to the entire window size
    this.c.width = window.innerWidth;
    this.c.height = window.innerHeight;

    // get appropriate num and size of columns
    this.numCols = Math.floor(this.c.width / horsize) + 1;  // add 1 for safety
    this.numChars = Math.floor(this.c.height / versize) + 1;

    // set columns up
    this.columns = [];
    for (let i = 0; i < this.numCols; i++)
      this.columns.push(new Column(this.numCols, this.numChars));
  }

  drawScreen() {
    this.ctx.font = "20px matrix_code";

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];

      // if there is still a delay, decrement and skip output
      if (col.delay) {
        col.delay--;
        continue;
      }

      for (let j = 0; j < col.chars.length; j++) {
        const char = col.chars[j];
        const horpos = i * horsize
        const verpos = j * versize
        const verout = verpos + versize  // zero-indexed!

        // different styles: first chars are whiter
        if (j > col.position) {
          break;
        }
        else if (j === col.position) {
          this.clearChar(horpos, verpos);
          this.ctx.fillStyle = "#f6f6f4";
          this.outputChar(char, horpos, verout);

        } else if (j === col.position - 1) {
          this.clearChar(horpos, verpos);
          this.ctx.fillStyle = "#c9cfb9";
          this.outputChar(char, horpos, verout);

        } else if (j === col.position - 2) {
          this.clearChar(horpos, verpos);
          this.ctx.fillStyle = "#95a297";
          this.outputChar(char, horpos, verout);

        // the rest of the chars are this colour
        } else if (j === col.position - 3) {
          this.clearChar(horpos, verpos);
          this.ctx.fillStyle = "#2cb231";
          this.outputChar(char, horpos, verout);

        // chars not whiter or fading have a chance of switching
        } else if (j < col.position - 3 && j >= (col.position - this.numChars + 10) && !randInt(15)) {
          const newChar = matrixAlphabet[randInt(matrixAlphabet.length)];
          this.clearChar(horpos, verpos);
          this.ctx.fillStyle = "#2cb231";
          this.outputChar(newChar, horpos, verout);

        // gradually fade out chars once column has passed by
        } else if (j < (col.position - this.numChars + 10) && j > (col.position - this.numChars - 10)) {
          this.ctx.fillStyle = !randInt(5) ? "rgba(0, 0, 0, 0.30)": "rgba(0, 0, 0, 0.05)";  // random fading
          this.ctx.fillRect(i * horsize, j * versize, horsize, versize);

        // definitely clear by this point
        } else if (j === (col.position - this.numChars - 10))
          this.clearChar(horpos, verpos);
      }

      col.delay = col.speed;
      col.position++;

      // once column is completely off screen: assign a random delay, regenerate contents, and reset to top
      if (col.position > (this.numChars * 2) + 10) {
        col.setChars(this.numChars);
        col.position = 0;
        col.delay = randInt(this.numCols * rainDensity / 2);
      }
    }

  }

}


window.addEventListener("load", async function () {
  let context = new Context();
  await context.intro();
  window.addEventListener("resize", context.setupCanvas.bind(context), false);
  context.setupCanvas();
  window.setInterval(context.drawScreen.bind(context), 40);
});
