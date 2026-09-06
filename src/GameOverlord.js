var startValues = {
    seeds: ['Knotweed', 'Bamboo'],
};
var shop = {
    seedsAndPrices: [
        [
            {
                name: 'Knotweed',
                price: 0.10,
                chance: 0.8,
                trimCost: 0.05,
            },
            {
                name: 'RedKnotweed',
                price: 0.35,
                chance: 0.5,
                trimCost: 0.05,
            },
            {
                name: 'Sunflower',
                price: 1.20,
                chance: 0.15
            },
            {
                name: 'Mistyweed',
                price: 1.20,
                chance: 0.0015
            },
            {
                name: 'Pigweed',
                price: 2.00,
                chance: 0.05
            },
            {
                name: 'Stinknet',
                price: 2.90,
                chance: 0.03
            }
        ],
        [
            {
                name: 'Crabgrass',
                price: 0.15,
                chance: 0.6
            },
            {
                name: 'Bamboo',
                price: 0.30,
                chance: 0.3
            },
            {
                name: 'Blackthorn',
                price: 1.20,
                chance: 0.12
            },
            {
                name: 'CherryBlossom',
                price: 5.00,
                chance: 0.01
            },
            {
                name: 'AloeVera',
                price: 4.30,
                chance: 0.02
            }
        ],
        [
            {
                name: 'Yucca',
                price: 0.50,
                chance: 0.6
            },
            {
                name: 'NorfolkPine',
                price: 2.50,
                chance: 0.3
            },
            {
                name: 'Kumquat',
                price: 3.15,
                chance: 0.1
            },
            {
                name: 'Porcini',
                price: 7.20,
                chance: 0.05
            },
            {
                name: 'Pachira',
                price: 9.00,
                chance: 0.01
            }
        ],
        [
            {
                name: 'CottonPlant',
                price: 4.00,
                chance: 0.5
            },
            {
                name: 'PeaceLily',
                price: 10.25,
                chance: 0.05
            },
            {
                name: 'Polypore',
                price: 7.50,
                chance: 0.1
            },
            {
                name: 'Cypress',
                price: 39.65,
                chance: 0.02,
                trimCost: 1.20,
            },
        ],
        [
            {
                name: 'Lavender',
                price: 8.50,
                chance: 0.4
            },
            {
                name: 'Tillandsia',
                price: 6.00,
                chance: 0.4
            },
            {
                name: 'Sativa',
                price: 7.10,
                chance: 0.4,
                trimCost: 1.00,
            },
            {
                name: 'Bonsai',
                price: 18.5,
                chance: 0.02
            },
        ]   
    ],
    potInitialPrice: 10,
    potIncrementPrice: 13,
    upgradePrices: [15, 50, 100, 300, 1000, 5000],
};

var playerControl = {
    seeds: [],
    seedCosts: [],
    favoriteSeeds: [],
    customSeeds: [],
    money: 0,
    potsPurchased: 0,
    upgradesPurchased: 0,
};

var gameConfig = {
    // 0 = now owned, 1 = owned but not planted, 2 = growing plant
    availablePots: [1, 1],
    values: [0, 0],
    seeds: ['',''],
    plantCosts: [0, 0],
    trees: [null, null],
};

var idleCreds = 0;
var resetting = false;
var plantActivity = [];

function resetPlantActivity(index) {
    plantActivity[index] = {
        lastValue: gameConfig.values[index] || 0,
        lastIncrease: Date.now()
    };
}

// Create a new planter cube dynamically
function createNewPlanter(index) {
    var gameBox = document.getElementById('gameBox');
    
    // Create the cube div
    var cube = document.createElement('div');
    cube.className = 'cube';
    cube.id = 'cube' + index;
    
    // Create the canvas
    var canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 300;
    canvas.id = 'bg' + index;
    canvas.style.color = '#09F';
    cube.appendChild(canvas);
    
    // Create pot visuals
    var rectangle = document.createElement('div');
    rectangle.className = 'rectangle pot';
    cube.appendChild(rectangle);
    
    var trapezoid = document.createElement('div');
    trapezoid.className = 'trapezoid pot';
    cube.appendChild(trapezoid);
    
    // Add planter information row
    var infoRow = document.createElement('div');
    infoRow.className = 'planter-row';

    var plantName = document.createElement('span');
    plantName.id = 'plantName' + index;
    infoRow.appendChild(plantName);

    var valueSpan = document.createElement('span');
    valueSpan.id = 'value' + index;
    valueSpan.innerText = 'Value: $0.00';
    infoRow.appendChild(valueSpan);
    cube.appendChild(infoRow);

    // Add planter actions row
    var actionsRow = document.createElement('div');
    actionsRow.className = 'planter-row';

    var sellBtn = document.createElement('button');
    sellBtn.onclick = (function(idx) {
        return function() { sell(idx); };
    })(index);
    sellBtn.innerHTML = 'Sell';
    actionsRow.appendChild(sellBtn);

    var trimBtn = document.createElement('button');
    trimBtn.id = 'trimBtn' + index;
    trimBtn.innerHTML = 'Prune';
    trimBtn.style.display = 'none';
    trimBtn.onclick = (function(idx) {
        return function() { trim(idx); };
    })(index);
    actionsRow.appendChild(trimBtn);
    cube.appendChild(actionsRow);
    
    var controls = document.getElementById('planterControls');
    if (controls) {
        gameBox.insertBefore(cube, controls);
    } else {
        gameBox.appendChild(cube);
    }
}

function createPlanterControls() {
    var gameBox = document.getElementById('gameBox');
    var controls = document.createElement('div');
    controls.className = 'cube';
    controls.id = 'planterControls';

    var heading = document.createElement('div');
    heading.innerText = 'Summary';
    heading.style.marginBottom = '12px';
    controls.appendChild(heading);

    var metrics = [
        ['Total sell price', 'totalPlantValue', '$0.00'],
        ['Spent on current plants', 'totalPlantCost', '$0.00'],
        ['Growing plants', 'growingPlantCount', '0'],
        ['Finished plants', 'donePlantCount', '0'],
        ['Available pots', 'availablePotCount', '0']
    ];
    for (let metric of metrics) {
        var metricRow = document.createElement('div');
        metricRow.innerText = metric[0] + ': ';

        var metricValue = document.createElement('span');
        metricValue.id = metric[1];
        metricValue.innerText = metric[2];
        metricRow.appendChild(metricValue);
        controls.appendChild(metricRow);
    }

    var buttons = document.createElement('div');
    buttons.style.marginTop = '12px';

    var sellAllButton = document.createElement('button');
    sellAllButton.innerText = 'Sell all';
    sellAllButton.addEventListener('click', sellAll);
    buttons.appendChild(sellAllButton);

    var resetButton = document.createElement('button');
    resetButton.innerText = 'Reset';
    resetButton.addEventListener('click', reset);
    buttons.appendChild(resetButton);
    controls.appendChild(buttons);

    gameBox.appendChild(controls);
}

function preGame() {
    var saveData = JSON.parse(localStorage.saveData || null) || {};

    if (saveData.gameConfig) {
        gameConfig = saveData.gameConfig;
        playerControl = saveData.playerControl;

        // Reset values for any plants that were mid-growth (they will be restarted fresh below)
        for (let i = 0; i < gameConfig.availablePots.length; i++) {
            if (gameConfig.availablePots[i] === 2) {
                gameConfig.values[i] = 0;
            }
        }

        idleCreds = Math.floor((new Date().getTime() - saveData.time)/ 10000);
    } else {
        generateInventory();
    }

    playerControl.seedCosts = playerControl.seedCosts || playerControl.seeds.map(function () { return 0; });
    playerControl.favoriteSeeds = playerControl.favoriteSeeds || [];
    gameConfig.plantCosts = gameConfig.plantCosts || gameConfig.seeds.map(function () { return 0; });
    while (gameConfig.plantCosts.length < gameConfig.seeds.length) {
        gameConfig.plantCosts.push(0);
    }
    for (let i = 0; i < gameConfig.availablePots.length; i++) {
        resetPlantActivity(i);
    }
    
    // Generate all existing planter cubes
    for (let i = 0; i < gameConfig.availablePots.length; i++) {
        createNewPlanter(i);
        
        // if a plant was in the middle of growing, restart it with fresh randomness
        if (gameConfig.availablePots[i] === 2) {
            startPot(i, gameConfig.seeds[i]);
        }
    }
    createPlanterControls();
    displayInventory();
    populateShop();
    var intervalID = setInterval(function () {
        update();
    }, 500);
}

// INVENTORY

function generateInventory() {
    playerControl.seeds = startValues.seeds;
    playerControl.seedCosts = startValues.seeds.map(function () { return 0; });
}

function displayInventory() {
    document.getElementById("inventory").innerHTML = '';
    for (let i = 0; i < playerControl.seeds.length; i++) {
        var button = document.createElement("button");
        button.innerHTML = playerControl.seeds[i];

        var inv = document.getElementById("inventory");
        inv.appendChild(button);

        button.addEventListener("click", function () {
            clickSeed(playerControl.seeds[i], playerControl.seedCosts[i]);
        });
    }
}

// SHOP
function populateShop(){
    populateSeedShop();
    populatePotShop();
    populateUpgradeShop();
}

function populateSeedShop() {
    document.getElementById("seedShop").innerHTML = '---<br>';
    var availableSeeds = [];

    for (let j = 0; j <= playerControl.upgradesPurchased; j++) {
        var seedOptions = shop.seedsAndPrices[j];
        var availableIndexes = [];

        while (availableIndexes.length < Math.min(2, seedOptions.length)) {
            var totalChance = 0;
            for (let i = 0; i < seedOptions.length; i++) {
                if (!availableIndexes.includes(i)) {
                    totalChance += Math.max(0, Number(seedOptions[i].chance) || 0);
                }
            }

            var selectedIndex;
            if (totalChance > 0) {
                var chanceRoll = Math.random() * totalChance;
                for (let i = 0; i < seedOptions.length; i++) {
                    if (availableIndexes.includes(i)) {
                        continue;
                    }

                    chanceRoll -= Math.max(0, Number(seedOptions[i].chance) || 0);
                    if (chanceRoll < 0) {
                        selectedIndex = i;
                        break;
                    }
                }
            } else {
                var remainingIndexes = [];
                for (let i = 0; i < seedOptions.length; i++) {
                    if (!availableIndexes.includes(i)) {
                        remainingIndexes.push(i);
                    }
                }
                selectedIndex = remainingIndexes[Math.floor(Math.random() * remainingIndexes.length)];
            }

            if (selectedIndex !== undefined) {
                availableIndexes.push(selectedIndex);
            }
        }

        for (let i = 0; i < availableIndexes.length; i++) {
            availableSeeds.push(seedOptions[availableIndexes[i]]);
        }
    }

    availableSeeds.sort(function (firstSeed, secondSeed) {
        var firstFavoriteIndex = playerControl.favoriteSeeds.indexOf(firstSeed.name);
        var secondFavoriteIndex = playerControl.favoriteSeeds.indexOf(secondSeed.name);
        return secondFavoriteIndex - firstFavoriteIndex;
    });

    // Show the combined list so favorites can move above every shop tier.
    for (let seed of availableSeeds) {
        var offer = document.createElement("div");
        offer.className = 'seed-offer';

        var button = document.createElement("button");
        button.innerHTML = seed.name + ' $' + seed.price.toFixed(2);
        offer.appendChild(button);

        button.addEventListener("click", function () {
            buy(seed.name, seed.price);
        });

        let favoriteButton = document.createElement("button");
        var isFavorite = playerControl.favoriteSeeds.includes(seed.name);
        favoriteButton.className = 'favorite-button' + (isFavorite ? ' active' : '');
        favoriteButton.innerText = '*';
        favoriteButton.title = isFavorite ? 'Remove favorite' : 'Favorite ' + seed.name;
        favoriteButton.setAttribute('aria-label', favoriteButton.title);
        favoriteButton.addEventListener("click", function () {
            toggleFavorite(seed.name, favoriteButton);
        });
        offer.appendChild(favoriteButton);
        document.getElementById("seedShop").appendChild(offer);
    }
}

function toggleFavorite(seedName, favoriteButton) {
    var favoriteIndex = playerControl.favoriteSeeds.indexOf(seedName);
    if (favoriteIndex >= 0) {
        playerControl.favoriteSeeds.splice(favoriteIndex, 1);
    } else {
        playerControl.favoriteSeeds.push(seedName);
    }

    if (favoriteButton) {
        var isFavorite = favoriteIndex < 0;
        favoriteButton.classList.toggle('active', isFavorite);
        favoriteButton.title = isFavorite ? 'Remove favorite' : 'Favorite ' + seedName;
        favoriteButton.setAttribute('aria-label', favoriteButton.title);
    }
    save();
}

function populatePotShop() {

    // calculate next pot price
    var price = shop.potInitialPrice + shop.potIncrementPrice*playerControl.potsPurchased;

    // reset and show html
    document.getElementById("potShop").innerHTML = '---<br>';

    var button = document.createElement("button");
    button.innerHTML = 'New Pot: $' + price;

    var inv = document.getElementById("potShop");
    inv.appendChild(button);

    button.addEventListener("click", function () {
        buyPot();
    });
}

function populateUpgradeShop() {

    // calculate next pot price
    var price = shop.upgradePrices[playerControl.upgradesPurchased];

    // reset and show html
    document.getElementById("upgradeShop").innerHTML = '---<br>';

    var button = document.createElement("button");
    button.innerHTML = 'Upgrade Shop: $' + price;

    var inv = document.getElementById("upgradeShop");
    inv.appendChild(button);

    button.addEventListener("click", function () {
        buyUpgrade();
    });
}

///// CONTROL

function update() {
    // update $$
    document.getElementById('money').innerHTML = playerControl.money.toFixed(2);

    var totalPlantValue = 0;
    var totalPlantCost = 0;
    var growingPlantCount = 0;
    var donePlantCount = 0;
    var availablePotCount = 0;
    var now = Date.now();

    // update values of plants
    for (let i = 0; i < gameConfig.values.length; i++) {
        if (gameConfig.availablePots[i] >= 1) {
            document.getElementById('value' + i).innerText = 'Value: $' + gameConfig.values[i].toFixed(2);
        }

        totalPlantValue += gameConfig.values[i];
        totalPlantCost += gameConfig.plantCosts[i] || 0;
        if (gameConfig.availablePots[i] === 1) {
            availablePotCount++;
        } else if (gameConfig.availablePots[i] === 2) {
            if (!plantActivity[i]) {
                resetPlantActivity(i);
            }
            if (gameConfig.values[i] > plantActivity[i].lastValue) {
                plantActivity[i].lastValue = gameConfig.values[i];
                plantActivity[i].lastIncrease = now;
            } else if (gameConfig.values[i] < plantActivity[i].lastValue) {
                plantActivity[i].lastValue = gameConfig.values[i];
                plantActivity[i].lastIncrease = now;
            }
            if (gameConfig.trees[i]
                && !gameConfig.trees[i].done
                && now - plantActivity[i].lastIncrease >= 5000) {
                gameConfig.trees[i].markDone();
            }
            if (gameConfig.trees[i] && gameConfig.trees[i].done) {
                donePlantCount++;
            } else {
                growingPlantCount++;
            }
        }

        var trimButton = document.getElementById('trimBtn' + i);
        var tree = gameConfig.trees[i];
        if (trimButton && gameConfig.availablePots[i] === 2 && tree && !tree.done) {
            trimButton.innerText = 'Prune $' + getTrimCost(gameConfig.seeds[i]).toFixed(2);
            trimButton.style.display = 'inline-block';
        } else if (trimButton) {
            trimButton.style.display = 'none';
        }
    }

    document.getElementById('totalPlantValue').innerText = '$' + totalPlantValue.toFixed(2);
    document.getElementById('totalPlantCost').innerText = '$' + totalPlantCost.toFixed(2);
    document.getElementById('growingPlantCount').innerText = growingPlantCount;
    document.getElementById('donePlantCount').innerText = donePlantCount;
    document.getElementById('availablePotCount').innerText = availablePotCount;

}

/// RESPONSIVE

function startPot(potInd, seed) {
    var canvas = $('#bg'+potInd);
    var primaryTree = new TreeGenerator(canvas, configurationExamples[seed], null, potInd, idleCreds);
    primaryTree.start();
    document.getElementById('plantName' + potInd).innerText = seed;
    if (primaryTree.settings.alsoGrow){
        var secondaryTree = new TreeGenerator(canvas, configurationExamples[seed].alsoGrow, null, potInd, idleCreds);
        secondaryTree.start();
        gameConfig.trees[potInd] = createPlantController(primaryTree, secondaryTree);
    } else {
        gameConfig.trees[potInd] = createPlantController(primaryTree);
    }
}

function createPlantController(primaryTree, secondaryTree) {
    var timedOut = false;
    return {
        get done() {
            return timedOut || (primaryTree.done && (!secondaryTree || secondaryTree.done));
        },
        markDone: function () {
            timedOut = true;
            save();
        },
        clear: function () {
            primaryTree.clear();
            if (secondaryTree) {
                secondaryTree.clear();
            }
        },
        trim: function () {
            timedOut = false;
            primaryTree.trim();
            if (secondaryTree) {
                secondaryTree.trim();
            }
        }
    };
}

function clickSeed(seed, seedCost) {
    var firstAvailable = gameConfig.availablePots.indexOf(1);
    if (firstAvailable >= 0) {
        gameConfig.availablePots[firstAvailable] = 2;
    } else {
        console.warn('no available pots');
        return;
    }
    // save the seed
    gameConfig.seeds[firstAvailable] = seed;
    gameConfig.plantCosts[firstAvailable] = seedCost || 0;
    resetPlantActivity(firstAvailable);

    startPot(firstAvailable, seed);
    playerControl.seeds.splice(playerControl.seeds.indexOf(seed), 1);
    displayInventory();
    save();
}

function sell(index) {
    playerControl.money += gameConfig.values[index];
    gameConfig.availablePots[index] = 1;
    if (gameConfig.trees[index]) {
        gameConfig.trees[index].clear();
    }
    gameConfig.trees[index] = null;
    gameConfig.values[index] = 0;
    gameConfig.seeds[index] = '';
    gameConfig.plantCosts[index] = 0;
    plantActivity[index] = null;
    document.getElementById('plantName' + index).innerText = '';
    save();
}

function getTrimCost(seedName) {
    for (let tier of shop.seedsAndPrices) {
        for (let seed of tier) {
            if (seed.name === seedName) {
                return typeof seed.trimCost === 'number' ? seed.trimCost : 0.50;
            }
        }
    }
    return 0.50;
}

function getSeedingChance(seedName) {
    var configuration = configurationExamples[seedName];
    return configuration && typeof configuration.seedingChance === 'number'
        ? configuration.seedingChance
        : 0;
}

function trim(index) {
    if (gameConfig.availablePots[index] !== 2
        || !gameConfig.trees[index]
        || gameConfig.trees[index].done) {
        return;
    }

    var trimCost = getTrimCost(gameConfig.seeds[index]);
    if (playerControl.money < trimCost) {
        console.warn('Not enough money to trim this plant');
        return;
    }

    playerControl.money -= trimCost;
    gameConfig.values[index] *= 0.5;
    gameConfig.trees[index].trim();
    resetPlantActivity(index);
    if (Math.random() < getSeedingChance(gameConfig.seeds[index])) {
        playerControl.seeds.push(gameConfig.seeds[index]);
        playerControl.seedCosts.push(0);
        displayInventory();
    }
    save();
}

function sellAll() {
    for (let i = 0; i < gameConfig.availablePots.length; i++) {
        if (gameConfig.availablePots[i] === 2) {
            sell(i);
        }
    }
}

function buy(seed, cost) {

    if (playerControl.money >= cost) {
        playerControl.money -= cost;
        playerControl.seeds.push(seed);
        playerControl.seedCosts.push(cost);
        if (document.getElementById('autoPlant').checked && gameConfig.availablePots.includes(1)) {
            clickSeed(seed, cost);
        } else {
            displayInventory();
        }
        populateSeedShop();

    } else {
        console.warn('Ain\'t got cash)');
    }
    save();
}

function buyPot() {
    var price = shop.potInitialPrice + shop.potIncrementPrice*playerControl.potsPurchased;
    if (playerControl.money >= price) {
        playerControl.money -= price;

        // Create a new planter at the current length
        var newIndex = gameConfig.availablePots.length;
        
        // Extend all the arrays
        gameConfig.availablePots.push(1);  // New pot is empty but available
        gameConfig.values.push(0);
        gameConfig.seeds.push('');
        gameConfig.plantCosts.push(0);
        gameConfig.trees.push(null);
        
        // Create the new planter cube in the DOM
        createNewPlanter(newIndex);
        
        playerControl.potsPurchased++;
        populatePotShop();

    } else {
        console.warn('Ain\'t got cash)');
    }
    save();
}

function buyUpgrade() {
    var price = shop.upgradePrices[playerControl.upgradesPurchased];
    if (playerControl.money >= price) {
        playerControl.money -= price;

        playerControl.upgradesPurchased++;
        populateSeedShop();
        populateUpgradeShop();

    } else {
        console.warn('Ain\'t got cash)');
    }
    save();
}

// Save/Load
function save() {
    if (resetting) return;

    var saveData = {};
    saveData.time = new Date().getTime();
    saveData.playerControl = playerControl;
    saveData.gameConfig = gameConfig;
    localStorage.saveData = JSON.stringify(saveData);
}
function reset() {
    localStorage.saveData = JSON.stringify({});
    resetting = true;
    window.location.reload();
}
window.onbeforeunload = function(){
    save();
 }