var startValues = {
    seeds: ['Knotweed', 'Swampweed', 'RedKnotweed']
};
var shop = {
    options: ['Knotweed', 'RedKnotweed', 'Mistyweed', 'Swampweed', 'CherryBlossom', 'DesertWeed', 'Bamboo'],
    prices: [0.10,/*     */0.35,/*      */1.20,/*    */2.00,/*    */5.00,/*        */2.90,/*     */0.30],
    potInitialPrice: 10,
    potIncrementPrice: 13,
};

var playerControl = {
    seeds: [],
    customSeeds: [],
    money: 0,
    potsPurchased: 0,
};

var gameConfig = {
    // 0 = now owned, 1 = owned but not planted, 2 = growing plant
    availablePots: [1, 1, 0, 0, 0, 0, 0, 0,],
    values: [0, 0, 0, 0, 0, 0, 0, 0,],
    trees: [null, null, null, null, null, null, null, null],
};


function preGame() {

    // hide all pots except first one
    for (let i = 0; i < 8; i++) {
        if (gameConfig.availablePots[i] === 0)
        document.getElementById('cube' + i).style.visibility = 'hidden';
    }
    generateInventory();
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
}

function populateSeedShop() {
    console.log(Date.now());
    var availableIndexes = [0, 0];
    // find some options randomly
    for (let i = Date.now().toLocaleString().length; i > 0; i--) {
        var value = Date.now().toLocaleString().substr(i, i+1);
        if (shop.options[value]) {
            availableIndexes[0] = value;
            break;
        }
    }
    for (let i = 0; i < Date.now().toLocaleString().length; i++) {
        var value = Date.now().toLocaleString().substr(i, i+1);
        if (shop.options[value] && value != availableIndexes[0]) {
            availableIndexes[1] = value;
            break;
        }
    }

    // show in the html
    document.getElementById("seedShop").innerHTML = '';
    for (let i = 0; i < availableIndexes.length; i++) {
        var button = document.createElement("button");
        button.innerHTML = shop.options[availableIndexes[i]] + ' $' + shop.prices[availableIndexes[i]].toFixed(2);

        var inv = document.getElementById("seedShop");
        inv.appendChild(button);

        button.addEventListener("click", function () {
            buy(shop.options[availableIndexes[i]], shop.prices[availableIndexes[i]]);
        });
    }
}

function populatePotShop() {

    // calculate next pot price
    var price = shop.potInitialPrice + shop.potIncrementPrice*playerControl.potsPurchased;

    // reset and show html
    document.getElementById("potShop").innerHTML = '';

    var button = document.createElement("button");
    button.innerHTML = 'New Pot: $' + price;

    var inv = document.getElementById("potShop");
    inv.appendChild(button);

    button.addEventListener("click", function () {
        buyPot();
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

function clickSeed(seed) {
    var set = null;
    var firstAvailable = gameConfig.availablePots.indexOf(1);
    console.log(firstAvailable);
    if (firstAvailable >= 0) {
        gameConfig.availablePots[firstAvailable] = 2;
    } else {
        console.warn('no available pots');
        return;
    }

    var canvas = $('#bg'+firstAvailable);
    gameConfig.trees[firstAvailable] = new TreeGenerator(canvas, configurationExamples[seed], set, firstAvailable);
    gameConfig.trees[firstAvailable].start();
    playerControl.seeds.splice(playerControl.seeds.indexOf(seed), 1);
    displayInventory();
}

function sell(index) {
        playerControl.money += gameConfig.values[index];
        gameConfig.availablePots[index] = 1;
        gameConfig.trees[index].clear(); // TODO: catch error
        gameConfig.values[index] = 0;
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
}