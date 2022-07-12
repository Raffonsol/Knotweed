var startValues = {
    seeds: ['Knotweed', 'Blackthorn', ],
};
var shop = {
    options0: ['Knotweed', 'RedKnotweed', 'Mistyweed', 'Swampweed', 'CherryBlossom', 'DesertWeed', 'Bamboo'],
    prices0: [0.10,/*     */0.35,/*      */1.20,/*    */2.00,/*    */5.00,/*        */2.90,/*     */0.30],
    options1: ['Crabgrass', 'Yucca', 'NorfolkPine', 'Porcini', 'CherryBlossom', 'Blackthorn', 'AloeVera'],
    prices1: [0.15,/*     */0.50,/*      */2.50,/*    */7.20,/*    */5.00,/*        */1.20,/*     */4.30],
    options2: ['PeaceLily', 'CottonPlant', 'Cypress', 'Pachira', 'Bonsai'],
    prices2: [10.25,/*    */4,/*         */39.65,/*     */9,/*    */18.5],
    potInitialPrice: 10,
    potIncrementPrice: 13,
    upgradePrices: [15, 50, 410, 1900],
};

var playerControl = {
    seeds: [],
    customSeeds: [],
    money: 0,
    potsPurchased: 0,
    upgradesPurchased: 0,
};

var gameConfig = {
    // 0 = now owned, 1 = owned but not planted, 2 = growing plant
    availablePots: [1, 1, 0, 0, 0, 0, 0, 0,0],
    values: [0, 0, 0, 0, 0, 0, 0, 0,0],
    seeds: ['','','','','','','','',''],
    trees: [null, null, null, null, null, null, null, null, null],
};
// array of arrays, each is the list of random numbers so far in a pot
var progressRecording = [
    [], [], [], [], [] ,[], [], [], []
];

var idleCreds = 0;
var resetting = false;

function preGame() {
    var saveData = JSON.parse(localStorage.saveData || null) || {};

    if (saveData.gameConfig) {
        gameConfig = saveData.gameConfig;
        playerControl = saveData.playerControl;
        progressRecording = saveData.progressRecording;

        idleCreds = Math.floor((new Date().getTime() - saveData.time)/ 10000);
    } else {
        generateInventory();
    }
    // hide all pots except first one
    for (let i = 0; i < gameConfig.availablePots.length; i++) {
        if (gameConfig.availablePots[i] === 0)
        document.getElementById('cube' + i).style.visibility = 'hidden';
        
        // if a plant was in the middle of growing 
        if (gameConfig.availablePots[i] === 2) {
            startPot(i, gameConfig.seeds[i]);
        }
    }
    displayInventory();
    populateShop();
    var intervalID = setInterval(function () {
        update();
    }, 500);
}

// INVENTORY

function generateInventory() {
    playerControl.seeds = startValues.seeds;
}

function displayInventory() {
    document.getElementById("inventory").innerHTML = '';
    for (let i = 0; i < playerControl.seeds.length; i++) {
        var button = document.createElement("button");
        button.innerHTML = playerControl.seeds[i];

        var inv = document.getElementById("inventory");
        inv.appendChild(button);

        button.addEventListener("click", function () {
            clickSeed(playerControl.seeds[i]);
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
    for (let j = 0; j <= playerControl.upgradesPurchased; j++) {


        var availableIndexes = [0, 0];
        // find some options randomly
        for (let i = Date.now().toLocaleString().length; i > 0; i--) {
            var value = Date.now().toLocaleString().substr(i, i + 1);
            if (shop['options'+j][value]) {
                availableIndexes[0] = value;
                break;
            }
        }
        for (let i = 0; i < Date.now().toLocaleString().length; i++) {
            var value = Date.now().toLocaleString().substr(i, i + 1);
            if (shop['options'+j][value] && value != availableIndexes[0]) {
                availableIndexes[1] = value;
                break;
            }
        }

        // show in the html
        for (let i = 0; i < availableIndexes.length; i++) {
            var button = document.createElement("button");
            button.innerHTML = shop['options'+j][availableIndexes[i]] + ' $' + shop['prices'+j][availableIndexes[i]].toFixed(2);

            var inv = document.getElementById("seedShop");
            inv.appendChild(button);

            button.addEventListener("click", function () {
                buy(shop['options'+j][availableIndexes[i]], shop['prices'+j][availableIndexes[i]]);
            });
        }
    }
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

    // update values of plants
    for (let i = 0; i < gameConfig.values.length; i++) {
        if (gameConfig.availablePots[i] >= 1)
            document.getElementById('value' + i).innerText = gameConfig.values[i].toFixed(2);
    }

}

/// RESPONSIVE

function startPot(potInd, seed) {
    var canvas = $('#bg'+potInd);
    gameConfig.trees[potInd] = new TreeGenerator(canvas, configurationExamples[seed], null, potInd, idleCreds);
    gameConfig.trees[potInd].start();
    document.getElementById('plantName' + potInd).innerText = seed;
    if (gameConfig.trees[potInd].settings.alsoGrow){
        gameConfig.trees[potInd] = new TreeGenerator(canvas, configurationExamples[seed].alsoGrow, null, potInd, idleCreds);
        gameConfig.trees[potInd].start();
    }
}

function clickSeed(seed) {
    var firstAvailable = gameConfig.availablePots.indexOf(1);
    if (firstAvailable >= 0) {
        gameConfig.availablePots[firstAvailable] = 2;
    } else {
        console.warn('no available pots');
        return;
    }
    // reset progress for that pot
    progressRecording[firstAvailable] = [];
    // save the seed
    gameConfig.seeds[firstAvailable] = seed;

    startPot(firstAvailable, seed);
    playerControl.seeds.splice(playerControl.seeds.indexOf(seed), 1);
    displayInventory();
    save();
}

function sell(index) {
        playerControl.money += gameConfig.values[index];
        gameConfig.availablePots[index] = 1;
        gameConfig.trees[index].clear(); // TODO: catch error
        gameConfig.values[index] = 0;
        document.getElementById('plantName' + index).innerText = '';
}

function buy(seed, cost) {

    if (playerControl.money >= cost) {
        playerControl.money -= cost;
        playerControl.seeds.push(seed);
        displayInventory();
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

        var nextPot = gameConfig.availablePots.indexOf(0);
        gameConfig.availablePots[nextPot] = 1;
        playerControl.potsPurchased++;
        document.getElementById('cube'+nextPot).style.visibility = 'visible';
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
    saveData.progressRecording = progressRecording;
    localStorage.saveData = JSON.stringify(saveData);
}
function reset() {
    localStorage.saveData = JSON.stringify({});
    resetting = true;
}
window.onbeforeunload = function(){
    save();
 }