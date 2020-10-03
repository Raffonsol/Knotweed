/**
 * TreeGenerator - 2D Tree generation in JavaScript
 * Documentation in comments
 *
 * This requires a farily modern browser, at least with support for the canvas object.
 *
 * @author Alejandro U. Alvarez
 * @version 1.0
 */

/**
 * Documentation in the source code. Private methods are defined
 * as local functions, while exposed ones are members of the returned object tg.
 * @param {Object} canvas jQuery DOM object for the canvas element
 * @param {Object} opts   Settings array, see default values and explanation below
 */
var TreeGenerator = function (canvas, opts, settings, potIndex) {
        var trunkWidth = 0;
        var trunkLifeTime = 0;
        var trunkDead = false;
        var tg = {};
        // Default settings
        tg.settings = settings ? settings : {
            upwardTendency: 0.12,  // how abruptly the branches will tend upward but it kinda affects the speed the branch grows too so its jenk
            branchStrengthAfterTrunkDeath: 0.2, // between 0.1 and 0.3 I would recommend
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 40,
            loss: 0.02, // Width loss per cycle
            baseLoss: 0.0009, // Width loss per cycle
            minSleep: 10, // Min sleep time (For the animation)
            branchLoss: 0.6, // % width maintained for branches
            mainLoss: 0.7, // % width maintained after branching
            speed: 0.25, // Movement speed
            newBranch: 0.55, // Chance of not starting a new branch
            leaves: 0.85, // Chance of not starting a new leaf
            leafSize: 0.7, // multiplier so go easy
            downyLeaves: true,
            downyCoefficient: 3.5,
            treeColor: 'rgba(230, 93, 80, 1)',
            leafColor: 'rgba(0,255,0,1)',
            maxLife: 200,
            worth: 1,
            // colorful: true, // Use colors for new trees

            //constants
            realTimeRate: 1, // the higher the slower. 1 for testing, 5 for game time
            realTime: true, // Slow growth mode
            fadeOut: false, // Fade slowly to black
            fadeAmount: 0.05, // How much per iteration
            autoSpawn: false, // Automatically create trees
            spawnInterval: 250, // Spawn interval in ms
            fadeInterval: 250, // Fade interval in ms
            initialWidth: 5, // Initial branch width
            indicateNewBranch: true, // Display a visual indicator when a new branch is born
            fitScreen: false, // Resize canvas to fit screen,
            bgColor: [0, 0, 0]
        };
        tg.done = false;

        tg.settings = $.extend(tg.settings, opts);
        // Initialize the canvas
        var canvas = {
            $el: canvas,
            ctx: canvas[0] ? canvas[0].getContext("2d") : undefined,
            WIDTH: canvas.width(),
            HEIGHT: canvas.height(),
            canvasMinX: canvas.offset() ? canvas.offset().left : undefined,
            canvasMaxX: canvas.canvasMinX + canvas.WIDTH,
            canvasMinY: canvas.offset() ? canvas.offset().top : undefined,
            canvasMaxY: canvas.canvasMinY + canvas.HEIGHT
        };
        // Generation intervals
        var intervals = {
            generation: null,
            fading: null
        };

        /**
         * Start generating trees at the specified interval. If none is specified
         * it takes the default interval found in the settings (spawnInterval)
         * @param  {int} interval Spawn interval
         * @param  {int} fadeInterval Fade interval
         * @return {void}
         */
        tg.start = function () {
            // Clear intervals
            tg.stop();
            var growthRate = 100;
            if (tg.settings.realTime) growthRate *= tg.settings.realTimeRate;
            branch(canvas.WIDTH / 2, canvas.HEIGHT, 0, -3, 10, growthRate, 0, tg.settings.treeColor, false);

        };

        /**
         * Stop generating trees
         * @return {void}
         */
        tg.stop = function () {
            clearInterval(intervals.generation);
            clearInterval(intervals.fading);
        };

        /**
         * Recursive function that generates the trees. This is the important part of the
         * generator. At any given point it continues in a logical manner, creating something similar
         * to a tree (at least using the default settings)
         * Appropriate tweaking of the settings can produce quite interesting results.
         * @param  {float} x           Current location, x coordinate
         * @param  {float} y           Current location, y coordinate
         * @param  {float} dx          Variation of the x coordinate, indicates where it will move
         * @param  {float} dy          Variation of the y coordinate, indicates where it will move
         * @param  {float} w           Current width
         * @param  {float} growthRate  This branch's growth rate
         * @param  {int} lifetime      Cycles that have already happened
         * @param  {String} branchColor Branch color
         * @return {void}
         */
        function branch(x, y, dx, dy, w, growthRate, lifetime, branchColor, notFirst) {
            if (!canvas.ctx || tg.done) return;
            // console.log(notFirst);
            canvas.ctx.lineWidth = w - lifetime * (notFirst ? tg.settings.loss : tg.settings.baseLoss);
            canvas.ctx.lineWidth = notFirst ? canvas.ctx.lineWidth * 0.90 : canvas.ctx.lineWidth;
            // if( !notFirst)console.log(canvas.ctx.lineWidth, mainWidth, w);

            if (notFirst) {
                // while (canvas.ctx.lineWidth > mainWidth) canvas.ctx.lineWidth-=0.01;
            } else {
                trunkWidth = canvas.ctx.lineWidth;

                trunkLifeTime += 1;
                gameConfig.values[potIndex] += 0.01 * tg.settings.worth;
            }
            if (trunkLifeTime > tg.settings.maxLife ) {
                console.log('done', trunkLifeTime, tg.settings.maxLife);
                done();
                return;
            }
            canvas.ctx.beginPath();
            canvas.ctx.moveTo(x, y);
            // console.log(lifetime, trunkLifeTime, trunkDead);
            // if (!notFirst) circle(x, y, w, 'rgba(255,0,0,0.4)');



            // Calculate new coords
            x = x + dx;
            y = y + dy;
            // Change dir
            dx = dx + Math.sin(Math.random() + lifetime) * tg.settings.speed;
            dy = dy + Math.cos(Math.random() + lifetime) * (tg.settings.speed) - (notFirst && lifetime * Math.random() < 15 ? tg.settings.upwardTendency : 0);

            // Check if branches are getting too low
            if (w < 6 && y > canvas.HEIGHT - Math.random() * (0.3 * canvas.HEIGHT)) w = w * 0.8;

            // Draw the next segment of the branch
            canvas.ctx.strokeStyle = branchColor || tg.settings.treeColor;
            canvas.ctx.lineTo(x, y);
            canvas.ctx.stroke();

            // adding leaves
            if (tg.settings.lifeBeforeLeafing < trunkLifeTime && Math.random() > tg.settings.leaves && notFirst) {
                // createFoliage(x, y, w, tg.settings.leafColor, x * Math.random(), './assets/leaf/generic.png');
                foliage(x, y, w, tg.settings.leafColor, x * Math.random());
            }

            // Generate new branches
            // they should spawn after a certain lifetime has been met, although depending on the width
            if (lifetime >
                tg.settings.heightBeforeBranchingBasedOnWidth * w + Math.random() * tg.settings.heightBeforeBranchingBasedOnHeight
                && Math.random() > tg.settings.newBranch) {
                setTimeout(function () {
                    // Indicate the birth of a new branch
                    if (tg.settings.indicateNewBranch) {
                        // circle(x, y, w, 'rgba(255,0,0,0.4)');
                    }
                    branch(x, y, 2 * Math.sin(Math.random() + lifetime), 2 * Math.cos(Math.random() + lifetime), (w - lifetime * tg.settings.loss) * tg.settings.branchLoss, growthRate + Math.random() * 100, 0, branchColor, true);
                    // When it branches, it looses a bit of width
                    w *= tg.settings.mainLoss;
                }, 2 * growthRate * Math.random() + tg.settings.minSleep);
            }
            // Continue the branch
            if (w - lifetime * tg.settings.loss >= 1
                && (!notFirst || (notFirst && lifetime <= trunkLifeTime))
                && (!trunkDead || (trunkDead && Math.random() * lifetime <= trunkLifeTime * tg.settings.branchStrengthAfterTrunkDeath))
            // || (!notFirst && canvas.ctx.width !== mainWidth)
            ) {
                setTimeout(function () {
                    branch(x, y, dx, dy, w, growthRate, ++lifetime, branchColor, notFirst);
                }, growthRate);
            } else if (!notFirst) {
                trunkDead = true;
            }
        }

        function done() {
            tg.done = true;
        }

        function createFoliage(x, y, rad, color, dir, src) {
            var img = new Image(tg.settings.leafSize * Math.random());
            img.src = src;
            img.style.transform = 'rotate(90deg)';
            img.color = color;
            img.width = (tg.settings.leafSize) * 40 * Math.random();
            // canvas.ctx.save();
            // canvas.ctx.rotate(1.2);
            canvas.ctx.style = color;
            canvas.ctx.drawImage(img, x, y, img.width, img.width);
        }

// -------------------------------//
//       Internal functions       //
// -------------------------------//

// Clear the canvas
        function clear() {
            done();
            canvas.ctx.clearRect(0, 0 - canvas.HEIGHT / 2, canvas.WIDTH, canvas.HEIGHT*2);
        }

        tg.clear = () => clear();

        /**
         * Draw a circle
         * @param  {int}    x     Center x coordinate
         * @param  {int}    y     Center y coordinate
         * @param  {int}    rad   Radius
         * @param  {String} color HTML color
         * @return {void}
         */
        function circle(x, y, rad, color) {
            // Circulo
            canvas.ctx.lineWidth = 1;
            canvas.ctx.strokeStyle = color;
            canvas.ctx.beginPath();
            canvas.ctx.arc(x, y, rad, 0, Math.PI * 2, true);
            canvas.ctx.closePath();
            canvas.ctx.stroke();
        }

        function foliage(x, y, rad, color, dir) {
            gameConfig.values[potIndex] += 0.001 * tg.settings.worth;

            canvas.ctx.save(); // save state
            canvas.ctx.beginPath();

            var rotation = dir;

            if (tg.settings.downyLeaves) {
                rotation = Math.random() * tg.settings.downyCoefficient - tg.settings.downyCoefficient / 2;
            }

            canvas.ctx.translate(1, 0);
            canvas.ctx.scale(1, 1);
            switch (tg.settings.leafType) {
                case 'mushroom':
                    canvas.ctx.ellipse(x, y, tg.settings.leafSize, tg.settings.leafSize, Math.PI, 0, Math.PI, false);
                    break;
                case 'thin':
                    canvas.ctx.ellipse(x, y, rad * tg.settings.leafSize, rad * tg.settings.leafSize, rotation + 3, 1, 2, false);
                    break;
                default:
                    // canvas.ctx.ellipse(x, y, Math.sqrt(rad) * tg.settings.leafSize, Math.sqrt(rad) * 5 * tg.settings.leafSize, rotation, 0, Math.PI, false);
                    canvas.ctx.ellipse(x, y, Math.sqrt(rad) * tg.settings.leafSize, Math.sqrt(rad) * 5 * tg.settings.leafSize, rotation, 0, Math.PI, false);
                    break;
            }


            canvas.ctx.restore(); // restore to original state
            canvas.ctx.strokeStyle = color;
            canvas.ctx.stroke();
        }

        function createPath(parent) {
            return $(document.createElementNS(ns, "path")).appendTo(parent);
        }

        function createLeaf(x, y, rad, color, dir) {
            canvas.ctx.beginPath();
            // canvas.ctx.moveTo(75, 40);
            rad *= 0.05;
            // rad+=dir;
            canvas.ctx.moveTo(x, y - 30 * rad);
            canvas.ctx.bezierCurveTo(x, y - 3 * rad, x - 5 * rad, y - 15 * rad, x - 15 * rad, y - 25 * rad);
            canvas.ctx.bezierCurveTo(x - 65 * rad, y - 30 * rad, x - 65 * rad, y + 22.5 * rad, x - 65 * rad, y + 22.5 * rad);
            canvas.ctx.bezierCurveTo(x - 65 * rad, y + 40 * rad, x - 35 * rad, y + 62 * rad, x, y + 90 * rad);
            canvas.ctx.bezierCurveTo(x + 35 * rad, y + 62 * rad, x + 65 * rad, y + 40 * rad, x + 65 * rad, y + 22.5 * rad);
            canvas.ctx.bezierCurveTo(x + 65 * rad, y + 22.5 * rad, x + 65 * rad, y, x + 25 * rad, y - 5 * rad);
            canvas.ctx.bezierCurveTo(x - 10 * rad, y - 15 * rad, x, y - 3 * rad, x, y - 30 * rad);


            canvas.ctx.moveTo(75, 10);
            canvas.ctx.bezierCurveTo(75, 37, 70, 25, 50, 35);
            canvas.ctx.bezierCurveTo(30, 40, 30, 62.5, 30, 62.5);
            canvas.ctx.bezierCurveTo(30, 80, 40, 102, 75, 130);
            canvas.ctx.bezierCurveTo(110, 102, 120, 80, 120, 62.5);
            canvas.ctx.bezierCurveTo(120, 62.5, 120, 40, 100, 35);
            canvas.ctx.bezierCurveTo(85, 25, 75, 37, 75, 10);


            canvas.ctx.fill();
            canvas.ctx.fillStyle = color;
            // canvas.ctx.rotate(dir * Math.PI);
        }


        /**
         * Resize the canvas to the window size
         * @param  {Object} e Event object
         * @return {void}
         */
        function resizeCanvas(e) {
            canvas.WIDTH = window.innerWidth;
            canvas.HEIGHT = window.innerHeight;

            canvas.$el.attr('width', canvas.WIDTH);
            canvas.$el.attr('height', canvas.HEIGHT);
        }

        /**
         * Return a new color, depending on the colorful setting
         * @return {String} HTML color
         */
        function newColor() {
            return '#' + Math.round(0xffffff * Math.random()).toString(16);
        }

        /**
         * Resize the canvas to fit the screen
         * @return {void}
         */
        tg.resizeCanvas = function () {
            canvas.WIDTH = window.innerWidth;
            canvas.HEIGHT = window.innerHeight;

            canvas.$el.attr('width', canvas.WIDTH);
            canvas.$el.attr('height', canvas.HEIGHT);
        };

        if (tg.settings.fitScreen) tg.resizeCanvas();

        return tg;

    }
;
