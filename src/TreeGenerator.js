
var TreeGenerator = function (canvas, opts, settings, potIndex, creds) {
        var trunkWidth = 0;
        var trunkLifeTime = 0;
        var branchLifeTime = 0;
        var trunkDead = false;
        var tg = {};
        var rewinding = false;
        var rewindTargetLifetime = 0;
        var growthPower = 1;


        var goingValue = 0;
        var loadingSpeed = true;
        var normalSpeed = 0;

        var increasedSpeed = 5;

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
            leafWorth: 0,
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
            realTimeRate: 1, // the higher the slower. 1 for testing, 15 for game time
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
        var growthTimeouts = new Set();

        function scheduleGrowth(callback, delay) {
            var timeoutId = setTimeout(function () {
                growthTimeouts.delete(timeoutId);
                callback();
            }, delay);
            growthTimeouts.add(timeoutId);
        }

        /**
         * Start generating trees at the specified interval. If none is specified
         * it takes the default interval found in the settings (spawnInterval)
         * @param  {int} interval Spawn interval
         * @param  {int} fadeInterval Fade interval
         * @return {void}
         */
        tg.start = function (startingLifetime) {
            // Clear intervals
            tg.stop();
            var growthRate = 100;
            startingLifetime = Math.max(0, Math.floor(startingLifetime || 0));
            if (tg.settings.realTime) growthRate *= tg.settings.realTimeRate;
            if (rewinding) growthRate = Math.max(25, growthRate / 5);
            normalSpeed = growthRate;
            loadingSpeed = false;

            branch(canvas.WIDTH / 2, canvas.HEIGHT, 0, -3, tg.settings.initialWidth, growthRate, startingLifetime, tg.settings.treeColor, false);
            var initialLocRange = tg.settings.initialLocRange?tg.settings.initialLocRange:60;

            // for when there are multiple main branches
            for (let i = 1; i < getRandomIntInclusive(tg.settings.mainBranches, tg.settings.mainBranchesMax || tg.settings.mainBranches); i++) {
                branch((canvas.WIDTH / 2) + Math.floor(getRandom() * initialLocRange) - initialLocRange/2, canvas.HEIGHT, 0, -3, tg.settings.initialWidth, growthRate, startingLifetime, tg.settings.treeColor, false);
            }
            // for when there cna be extra main branches randomly
            for (let i = 0; i < Math.floor(getRandom()*tg.settings.extraBranches); i++) {
                branch((canvas.WIDTH / 2) + Math.floor(getRandom() * initialLocRange) - initialLocRange/2, canvas.HEIGHT, 0, -3, tg.settings.initialWidth, growthRate, startingLifetime, tg.settings.treeColor, false);
            }

        };

        /**
         * Stop generating trees
         * @return {void}
         */
        tg.stop = function () {
            clearInterval(intervals.generation);
            clearInterval(intervals.fading);
            growthTimeouts.forEach(function (timeoutId) {
                clearTimeout(timeoutId);
            });
            growthTimeouts.clear();
        }

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
            if (rewinding && trunkLifeTime >= rewindTargetLifetime) {
                rewinding = false;
                growthRate = 100 * (tg.settings.realTime ? tg.settings.realTimeRate : 1);
                normalSpeed = growthRate;
            }
            if (trunkLifeTime > tg.settings.maxLife * growthPower
                || (tg.settings.maxBranchLife && branchLifeTime > tg.settings.maxBranchLife * growthPower)) {
                if (tg.settings.leafOnTip)foliage(x, y, (w - lifetime * tg.settings.loss)*tg.settings.mainLoss, tg.settings.leafColor, x * getRandom());
                done(false);
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

            if ((!loadingSpeed && growthRate < (normalSpeed - 1))) {
                growthRate*=500;
            }

            // Generate new branches
            // they should spawn after a certain lifetime has been met, although depending on the width
            if (lifetime >
                tg.settings.heightBeforeBranchingBasedOnWidth * w + getRandom() * tg.settings.heightBeforeBranchingBasedOnHeight
                && getRandom() > tg.settings.newBranch) {
                scheduleGrowth(function () {
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
                scheduleGrowth(function () {
                    branch(x, y, dx, dy, w, growthRate, ++lifetime, branchColor, notFirst);
                }, growthRate);
            } else  {
                if (tg.settings.leafOnTip)foliage(x, y, (w - lifetime * tg.settings.loss), tg.settings.leafColor, x * getRandom());
                if (!notFirst) trunkDead = true;
            }
        }

        function done(stopGrowth) {
            if (stopGrowth !== false) {
                tg.stop();
            }
            save();
            tg.done = true;
        }


// -------------------------------//
//       Internal functions       //
// -------------------------------//

// Clear the canvas
        function clear() {
            tg.stop();
            done();
            canvas.ctx.clearRect(0, 0 - canvas.HEIGHT / 2, canvas.WIDTH, canvas.HEIGHT*2);
        }

        tg.clear = () => clear();

        tg.trim = function () {
            var trimmedLifetime = Math.max(0, Math.floor(trunkLifeTime / 2));
            growthPower *= 1.05;
            tg.stop();
            clear();
            trunkLifeTime = 0;
            branchLifeTime = 0;
            trunkDead = false;
            tg.done = false;
            goingValue *= 0.5;
            rewindTargetLifetime = trimmedLifetime;
            rewinding = true;
            tg.start();
        };

        tg.getProgress = function () {
            return trunkLifeTime;
        };

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

            var saveLineWidth = canvas.ctx.lineWidth; // save line width
            canvas.ctx.lineWidth = tg.settings.leafThickness === 0 ? canvas.ctx.lineWidth : tg.settings.leafThickness;

            canvas.ctx.save(); // save state
            canvas.ctx.beginPath();

            var rotation = dir;

            var sizeToUse = getRandomIntInclusive(tg.settings.leafSize, tg.settings.leafSizeMax || tg.settings.leafSize);

            if (tg.settings.downyLeaves) {
                rotation = getRandom() * tg.settings.downyCoefficient - tg.settings.downyCoefficient / 2;
            }
            canvas.ctx.translate(1, 0);
            canvas.ctx.scale(1, 1);

            switch (tg.settings.leafType) {
                case 'mushroom':
                    canvas.ctx.ellipse(x, y, sizeToUse, sizeToUse, Math.PI+rotation, 0, Math.PI, false);
                    break;
                case 'thin':
                    // canvas.ctx.ellipse(x, y, rad * sizeToUse, rad * sizeToUse, rotation + 3, 1, 2, false);
                    canvas.ctx.ellipse(x, y, Math.sqrt(rad) * sizeToUse / 5, Math.sqrt(rad) * tg.settings.leafSharpness * sizeToUse, rotation, 0, Math.PI, false);
                    break;
                case 'oval':
                    var ovalRadiusX = Math.sqrt(rad) * sizeToUse / 5;
                    var ovalRadiusY = Math.sqrt(rad) * tg.settings.leafSharpness * sizeToUse / 5;
                    var ovalCenterX = x + Math.sin(rotation) * ovalRadiusY;
                    var ovalCenterY = y - Math.cos(rotation) * ovalRadiusY;
                    canvas.ctx.ellipse(ovalCenterX, ovalCenterY, ovalRadiusX, ovalRadiusY, rotation, 0, Math.PI * 2, false);
                    break;
                case 'lobed':
                    var lobedScale = Math.sqrt(rad) * sizeToUse / 5;
                    var lobedSharpness = Math.max(0.25, Number(tg.settings.leafSharpness) || 1);
                    var lobedPointScale = Math.max(0.65, Math.min(1.8, Math.sqrt(lobedSharpness)));
                    canvas.ctx.translate(x, y);
                    canvas.ctx.rotate(rotation);
                    canvas.ctx.scale(lobedPointScale, lobedPointScale);
                    canvas.ctx.translate(0, -1.25 * lobedScale);
                    canvas.ctx.moveTo(0, 1.25 * lobedScale);
                    canvas.ctx.lineTo(-0.12 * lobedScale, 0.72 * lobedScale);
                    canvas.ctx.lineTo(-0.75 * lobedScale, 0.9 * lobedScale);
                    canvas.ctx.lineTo(-0.58 * lobedScale, 0.35 * lobedScale);
                    canvas.ctx.lineTo(-1.4 * lobedScale, 0.4 * lobedScale);
                    canvas.ctx.lineTo(-0.95 * lobedScale, -0.15 * lobedScale);
                    canvas.ctx.lineTo(-1.55 * lobedScale, -0.55 * lobedScale);
                    canvas.ctx.lineTo(-0.55 * lobedScale, -0.52 * lobedScale);
                    canvas.ctx.lineTo(-0.7 * lobedScale, -1.15 * lobedScale);
                    canvas.ctx.lineTo(0, -0.7 * lobedScale);
                    canvas.ctx.lineTo(0.7 * lobedScale, -1.15 * lobedScale);
                    canvas.ctx.lineTo(0.55 * lobedScale, -0.52 * lobedScale);
                    canvas.ctx.lineTo(1.55 * lobedScale, -0.55 * lobedScale);
                    canvas.ctx.lineTo(0.95 * lobedScale, -0.15 * lobedScale);
                    canvas.ctx.lineTo(1.4 * lobedScale, 0.4 * lobedScale);
                    canvas.ctx.lineTo(0.58 * lobedScale, 0.35 * lobedScale);
                    canvas.ctx.lineTo(0.75 * lobedScale, 0.9 * lobedScale);
                    canvas.ctx.lineTo(0.12 * lobedScale, 0.72 * lobedScale);
                    canvas.ctx.closePath();
                    break;
                default:
                    // canvas.ctx.ellipse(x, y, Math.sqrt(rad) * sizeToUse, Math.sqrt(rad) * 5 * sizeToUse, rotation, 0, Math.PI, false);
                    canvas.ctx.ellipse(x, y, Math.sqrt(rad) * sizeToUse, Math.sqrt(rad) * tg.settings.leafSharpness * sizeToUse, rotation, 0, Math.PI, false);
                    break;
            }
            if (tg.settings.leafWorth){
                addValue( 1 * tg.settings.leafWorth);
            }

            canvas.ctx.lineWidth = saveLineWidth;
            canvas.ctx.restore(); // restore to original state
            if (tg.settings.fillColor) {
                canvas.ctx.fillStyle = tg.settings.fillColor;
                canvas.ctx.fill();
            }
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

        // gets a random number
        function getRandom() {
            return Math.random();
        }
        function getRandomIntInclusive(min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
        // update value of pot
        function addValue(value) {
            if (rewinding) {
                return;
            }
            // dont add if max already reached
            if (!(gameConfig.values[potIndex] <= tg.settings.maxValue)) {
                return;
            }
                // increase local saved value
                goingValue += (Math.random()+0.5) * value;
                // update gameConfig value only if local saved is greater, so that it can support loading
                if (gameConfig.values[potIndex] < goingValue) {
                    gameConfig.values[potIndex] = goingValue;
                }
        }

        return tg;

    }
;
