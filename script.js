// CONST -------------------------------------------------------------------------------------------

const WORLD = {
	MAX_BAMBOO: 2000,
	INIT_BAMBOO_COUNT: 12,
	BACKGROUND_COLOR: '#33a853'
}

const BAMBOO = {
	WIDTH: 20,
	SEGMENT_HEIGHT: 60,
	SEGMENT_GAP: 2,
	STROKE_COLOR: '#23833d66'
}

Math.HALF_PI = Math.PI / 2;
Math.TWO_PI = Math.PI * 2;

// GLOBAL ------------------------------------------------------------------------------------------

function randomInt(min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
}

function randomDec(min, max) {
	return Math.random() * (max - min) + min;
}

function randomBool() {
	return randomOdds(0.5);
}

function randomOdds(likelihood) {
	return Math.random() < likelihood;
}

function randomColor() {
	var r = Math.round(Math.random() * 255);
	var g = Math.round(Math.random() * 255);
	var b = Math.round(Math.random() * 255);
	var a = 1; // (Math.random()*.3)+.4;
	return `rgba(${r}, ${g}, ${b}, ${a})`
}

function distance(a, b) {
	return Math.sqrt(
		Math.pow(a.x - b.x, 2) +
		Math.pow(a.y - b.y, 2) +
		Math.pow(a.z - b.z, 2)
	);
}

// WORLD -------------------------------------------------------------------------------------------

class World {
	constructor(ctx, width, height) {
		this.ctx = ctx;
		this.W = width;
		this.H = height;
		this.bamboo = [];

		this.maxSegments = Math.floor(this.H / BAMBOO.SEGMENT_HEIGHT) - 5;
	}

	init() {
		this.drawBackground();
		this.initBamboo();
		this.drawBamboo(0);
	}

	initBamboo(d) {
		let x = BAMBOO.WIDTH;
		while (x < this.W) {
			this.bamboo.push(new Bamboo(this, this.ctx, x));
			x += BAMBOO.WIDTH * 2 + randomInt(-4, 4);
		}
		this.bamboo.sort(() => Math.random() - 0.5);
	}

	drawBackground() {
		this.ctx.rect(0, 0, this.W, this.H);
		this.ctx.fillStyle = WORLD.BACKGROUND_COLOR;
		this.ctx.fill();
	}

	draw3Bamboo(i) {
		for (let j = 0; j < 3; ++j) {
			if (i === this.bamboo.length) {
				return i;
			}
			this.bamboo[i].draw();
			++i;
		}
		return i;
	}

	drawBamboo(i) {
		if (i === this.bamboo.length) {
			return;
		}

		i = this.draw3Bamboo(i);

		setTimeout(() => {
			this.drawBamboo(i);
		}, 60);
	}
}

// BAMBOO ------------------------------------------------------------------------------------------

class Bamboo {
	constructor(world, ctx, x) {
		this.world = world;
		this.ctx = ctx;

		// set a base
		this.base = {
			x,
			y: this.world.H + Math.random() * .8 * BAMBOO.SEGMENT_HEIGHT
		};

		// add one segment to start
		this.segments = [];
		this.segments.push(this.makeSegment(this.base));
		this.grow();

		// this.leaves = [];
		// this.segments.forEach(segment => {
		//   const leaf = this.makeLeaf(segment.p4);
		//   this.leaves.push(leaf);
		// })
	}

	grow() {
		const maxSegments = this.world.maxSegments + randomInt(-3, 3);
		const dir = randomBool()
		for (let i = 0; i < maxSegments; ++i) {
			const lastSegment = this.segments[this.segments.length - 1];
			this.segments.push(this.makeSegment(lastSegment.p4, dir));
		}
	}

	makeSegment({ x, y }, dir) {
		y = y - BAMBOO.SEGMENT_GAP;
		let nextX = x + randomInt(-2, 0);
		if (!!dir) {
			nextX = x + randomInt(0, 2);
		}
		return {
			p1: { x, y },
			p2: { x: x + randomInt(-3, 3), y: y - randomInt(16, 24) },
			p3: { x: x + randomInt(-3, 3), y: y - 20 - randomInt(16, 24) },
			p4: { x: nextX, y: y - 40 - randomInt(14, 28) }, // BAMBOO.SEGMENT_HEIGHT
		}
	}

	draw() {
		this.drawSegment(0);
	}

	drawSegment(i) {
		if (i === this.segments.length - 1) {
			return;
		}

		const { p1, p2, p3, p4 } = this.segments[i];
		this.ctx.beginPath();
		this.ctx.moveTo(p1.x, p1.y);
		this.ctx.bezierCurveTo(p2.x, p2.y, p3.x, p3.y, p4.x, p4.y);
		this.ctx.strokeStyle = BAMBOO.STROKE_COLOR;
		this.ctx.lineWidth = BAMBOO.WIDTH;
		this.ctx.stroke();

		setTimeout(() => {
			this.drawSegment(++i);
		}, 30);
	}


}

// MAIN --------------------------------------------------------------------------------------------

window.onload = function () {
	const canvas = document.getElementById("canvas");
	const ctx = canvas.getContext("2d");

	const W = window.innerWidth, H = window.innerHeight;
	canvas.width = W;
	canvas.height = H;

	const world = new World(ctx, W, H);
	world.init();
}