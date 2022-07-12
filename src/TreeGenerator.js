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
var TreeGenerator = function (canvas, opts, settings, potIndex, creds) {
        var trunkWidth = 0;
        var trunkLifeTime = 0;
        var branchLifeTime = 0;
        var trunkDead = false;
        var tg = {};


        var goingValue = 0;
        var loadingSpeed = true;

        var increasedSpeed = 5;
        var normalSpeed = 0;

        var growthCreds = creds || 0;
        

        // Default settings
        tg.settings = settings ? settings : {
            upwardTendency: 0.12,  // how abruptly the branches will tend upward but it kinda affects the speed the branch grows too so its jenk
            tendencyAffectsMainBranch: false,
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
            downyLeaves: true,
            downyCoefficient: 3.5,
            treeColor: 'rgba(230, 93, 80, 1)',
            leafColor: 'rgba(0,255,0,1)',
            maxLife: 200,
            worth: 1,
            maxValue: 99999,
            sources: 1,
            leafSize: 0.7, // multiplier so go easy
            leafSharpness: 5, // how pointy the edge is
            leafThickness: 0,
            leafOnTip: false,
            mainBranches: 1,
            extraBranches: 0,
            leafType: null,

            openStrength: 0.1,
            openTillLife: 0,

            //constants
            realTimeRate: 15, // the higher the slower. 1 for testing, 5 for game time
            realTime: true, // Slow growth mode
            initialWidth: 5, // Initial branch width

            alsoGrow: null, // can be set to another plant config / array not supported yet
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
            normalSpeed = growthRate;
            // grow fast while loading
            if (progressRecording[potIndex][randomIndex]) {
                loadingSpeed = true;
                growthRate/=500;
                increasedSpeed = growthRate;
            } else {
                loadingSpeed = false;
            }

            branch(canvas.WIDTH / 2, canvas.HEIGHT, 0, -3, tg.settings.initialWidth, growthRate, 0, tg.settings.treeColor, false);
            var initialLocRange = tg.settings.initialLocRange?tg.settings.initialLocRange:60;

            // for when there are multiple main branches
            for (let i = 1; i < tg.settings.mainBranches; i++) {
                branch((canvas.WIDTH / 2) + Math.floor(getRandom() * initialLocRange) - initialLocRange/2, canvas.HEIGHT, 0, -3, tg.settings.initialWidth, growthRate, 0, tg.settings.treeColor, false);
            }
            // for when there cna be extra main branches randomly
            for (let i = 0; i < Math.floor(getRandom()*tg.settings.extraBranches); i++) {
                branch((canvas.WIDTH / 2) + Math.floor(getRandom() * initialLocRange) - initialLocRange/2, canvas.HEIGHT, 0, -3, tg.settings.initialWidth, growthRate, 0, tg.settings.treeColor, false);
            }
            

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
            if (!canvas.ctx || tg.done){
                if (tg.settings.leafOnTip)foliage(x, y, (w - lifetime * tg.settings.loss)*tg.settings.mainLoss, tg.settings.leafColor, x * getRandom());
                 return;
                }
            // console.log(notFirst);
            canvas.ctx.lineWidth = w - lifetime * (notFirst ? tg.settings.loss : tg.settings.baseLoss);
            canvas.ctx.lineWidth = notFirst ? canvas.ctx.lineWidth * 0.90 : canvas.ctx.lineWidth;
            // if( !notFirst)console.log(canvas.ctx.lineWidth, mainWidth, w);

            if (notFirst) {
                // while (canvas.ctx.lineWidth > mainWidth) canvas.ctx.lineWidth-=0.01;
                branchLifeTime +=1;
            } else {
                trunkWidth = canvas.ctx.lineWidth;
                trunkLifeTime += 1;

                // add money
                addValue( 0.01 * tg.settings.worth);
            }
            if (trunkLifeTime > tg.settings.maxLife ||branchLifeTime >tg.settings.maxBranchLife) {
                if (tg.settings.leafOnTip)foliage(x, y, (w - lifetime * tg.settings.loss)*tg.settings.mainLoss, tg.settings.leafColor, x * getRandom());
                done();
                return;
            }
            canvas.ctx.beginPath();
            canvas.ctx.moveTo(x, y);

            // Calculate new coords
            x = x + dx;
            y = y + dy;

            // branch movement changes
            switch (tg.settings.pattern) {
                case '1':
                default:
                    // Change dir
                    dx = dx + Math.sin(getRandom() + lifetime) * tg.settings.speed;
                    dy = dy + Math.cos(getRandom() + lifetime) * (tg.settings.speed) -
                        ((notFirst || tg.settings.tendencyAffectsMainBranch) && lifetime * getRandom() < 15 ? tg.settings.upwardTendency : 0);
   
                    // Check if branches are getting too low
                    if (w < 6 && y > canvas.HEIGHT - getRandom() * (0.3 * canvas.HEIGHT)) w = w * 0.8;
                    break;
                case '2':
                    // Change dir
                    dx = dx + Math.cos(getRandom() + lifetime) * tg.settings.speed + (getRandom()- 0.45)*tg.settings.upwardTendency;
                    dy = dy + Math.sin(getRandom() + lifetime) * (tg.settings.speed);
                    // Check if branches are getting too low
                    if (w < 6 && y > canvas.HEIGHT - getRandom() * (0.3 * canvas.HEIGHT)) dy = dy * 1.09;
                    break;
            }
            // controlling openess
            if (lifetime<tg.settings.openTillLife)dx+= (x > canvas.WIDTH/2) ? tg.settings.openStrength : -1*tg.settings.openStrength;


            // Draw the next segment of the branch
            canvas.ctx.strokeStyle = branchColor || tg.settings.treeColor;
            canvas.ctx.lineTo(x, y);
            canvas.ctx.stroke();

            // adding leaves
            if (tg.settings.lifeBeforeLeafing < trunkLifeTime && getRandom() > tg.settings.leaves && notFirst) {
                // createFoliage(x, y, w, tg.settings.leafColor, x * getRandom(), './assets/leaf/generic.png');
                foliage(x, y, w, tg.settings.leafColor, x * getRandom());
            }

            // check growth rate
            if ((loadingSpeed && !progressRecording[potIndex][randomIndex])) {
                if (growthCreds > 0) {
                    growthCreds -=1;
                } else {
                    loadingSpeed = false;
                    growthRate*=500;
                    save();
                }   
            } else if ((!loadingSpeed && growthRate < (normalSpeed - 1))) {
                growthRate*=500;
            }

            // Generate new branches
            // they should spawn after a certain lifetime has been met, although depending on the width
            if (lifetime >
                tg.settings.heightBeforeBranchingBasedOnWidth * w + getRandom() * tg.settings.heightBeforeBranchingBasedOnHeight
                && getRandom() > tg.settings.newBranch) {
                setTimeout(function () {
                    // Indicate the birth of a new branch
                    if (tg.settings.indicateNewBranch) {
                        // circle(x, y, w, 'rgba(255,0,0,0.4)');
                    }
                    branch(x, y, 2 * Math.sin(getRandom() + lifetime), 2 * Math.cos(getRandom() + lifetime), (w - lifetime * tg.settings.loss) * tg.settings.branchLoss, growthRate + getRandom() * 100, 0, branchColor, true);
                    // When it branches, it looses a bit of width
                    w *= tg.settings.mainLoss;
                }, 2 * growthRate * getRandom() + tg.settings.minSleep);
            }
            // Continue the branch
            if (w - lifetime * tg.settings.loss >= 1
                && (!notFirst || (notFirst && lifetime <= trunkLifeTime))
                && (!trunkDead || (trunkDead && getRandom() * lifetime <= trunkLifeTime * tg.settings.branchStrengthAfterTrunkDeath))
            // || (!notFirst && canvas.ctx.width !== mainWidth)
            ) {
                setTimeout(function () {
                    branch(x, y, dx, dy, w, growthRate, ++lifetime, branchColor, notFirst);
                }, growthRate);
            } else  {
                if (tg.settings.leafOnTip)foliage(x, y, (w - lifetime * tg.settings.loss), tg.settings.leafColor, x * getRandom());
                if (!notFirst) trunkDead = true;
            }
        }

        function done() {
            save();
            tg.done = true;
        }

        function createFoliage(x, y, rad, color, dir, src) {
            var img = new Image(tg.settings.leafSize * getRandom());
            img.src = src;
            img.style.transform = 'rotate(90deg)';
            img.color = color;
            img.width = (tg.settings.leafSize) * 40 * getRandom();
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
            // add money
            addValue( 0.001 * (tg.settings.leafWorth ? tg.settings.leafWorth : tg.settings.worth));

            var saveLineWidth = canvas.ctx.lineWidth; // save line width
            canvas.ctx.lineWidth = tg.settings.leafThickness === 0 ? canvas.ctx.lineWidth : tg.settings.leafThickness;

            canvas.ctx.save(); // save state
            canvas.ctx.beginPath();

            var rotation = dir;

            if (tg.settings.downyLeaves) {
                rotation = getRandom() * tg.settings.downyCoefficient - tg.settings.downyCoefficient / 2;
            }
            canvas.ctx.translate(1, 0);
            canvas.ctx.scale(1, 1);

            switch (tg.settings.leafType) {
                case 'mushroom':
                    canvas.ctx.ellipse(x, y, tg.settings.leafSize, tg.settings.leafSize, Math.PI+rotation, 0, Math.PI, false);
                    break;
                case 'thin':
                    // canvas.ctx.ellipse(x, y, rad * tg.settings.leafSize, rad * tg.settings.leafSize, rotation + 3, 1, 2, false);
                    canvas.ctx.ellipse(x, y, Math.sqrt(rad) * tg.settings.leafSize / 5, Math.sqrt(rad) * tg.settings.leafSharpness * tg.settings.leafSize, rotation, 0, Math.PI, false);
                    break;
                default:
                    // canvas.ctx.ellipse(x, y, Math.sqrt(rad) * tg.settings.leafSize, Math.sqrt(rad) * 5 * tg.settings.leafSize, rotation, 0, Math.PI, false);
                    canvas.ctx.ellipse(x, y, Math.sqrt(rad) * tg.settings.leafSize, Math.sqrt(rad) * tg.settings.leafSharpness * tg.settings.leafSize, rotation, 0, Math.PI, false);
                    break;
            }

            canvas.ctx.lineWidth = saveLineWidth;
            canvas.ctx.restore(); // restore to original state
            canvas.ctx.strokeStyle = color;
            canvas.ctx.stroke();
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

        var randomIndex = 0;
        // gets a random number or loads a previously generated one
        function getRandom() {
            var res;
            if (progressRecording[potIndex][randomIndex]) {
                res = progressRecording[potIndex][randomIndex];
            } else {
                res = Math.random( );
                progressRecording[potIndex][randomIndex] = res;
            }
            randomIndex++;
            return res;
        }

        // update value of pot
        function addValue(value) {
            // dont add if max already reached
            if (!(gameConfig.values[potIndex] <= tg.settings.maxValue)) {
                return;
            }
                // increase local saved value
                goingValue += value;
                // update gameConfig value only if local saved is greater, so that it can support loading
                if (gameConfig.values[potIndex] < goingValue)
                    gameConfig.values[potIndex] = goingValue;
        }

        return tg;

    }
;
