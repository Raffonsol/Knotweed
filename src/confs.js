var configurationExamples = {
    Knotweed:
        {
            upwardTendency: 0.12,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 40,
            loss: 0.02,
            baseLoss: 0.0009,
            minSleep: 10,
            branchLoss: 0.6,
            mainLoss: 0.7,
            speed: 0.25,
            newBranch: 0.55,
            leaves: 0.85,
            leafSize: 0.7,
            downyLeaves: true,
            downyCoefficient: 3.5,
            treeColor: 'rgba(230, 93, 80, 1)',
            leafColor: 'rgba(0,255,0,1)',
            fadeOut: false,
            fadeAmount: 0.05,
            autoSpawn: false,
            spawnInterval: 250,
            fadeInterval: 250,
            initialWidth: 10,
            indicateNewBranch: true,
            fitScreen: false,
            bgColor: [0, 0, 0]
        },
    RedKnotweed: {
        upwardTendency: 0.12,
        branchStrengthAfterTrunkDeath: 0.2,
        heightBeforeBranchingBasedOnWidth: 0,
        heightBeforeBranchingBasedOnHeight: 59,
        lifeBeforeLeafing: 20,
        loss: 0.02,
        baseLoss: 0.0009,
        minSleep: 10,
        branchLoss: 0.6,
        mainLoss: 0.7,
        speed: 0.25,
        newBranch: 0.55,
        leaves: 0.85,
        leafSize: 0.7,
        downyLeaves: true,
        downyCoefficient: 3.5,
        treeColor: 'rgba(230, 200, 200, 1)',
        leafColor: 'rgba(255,25,0,1)',
        worth: 1.2,
        initialWidth: 10,
    },
    Mistyweed:
        {
            upwardTendency: 0.5,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 20,
            loss: 0.02,
            baseLoss: 0.0009,
            minSleep: 10,
            branchLoss: 0.6,
            mainLoss: 0.7,
            speed: 0.25,
            newBranch: 0.55,
            leaves: 0.85,
            leafSize: 0.7,
            downyLeaves: true,
            downyCoefficient: 3.5,
            treeColor: 'rgba(100, 22,20, 1)',
            leafColor: 'rgba(25,255,233,1)',
            worth: 2,
            initialWidth: 10,
        },
    Swampweed:
        {
            upwardTendency: 0.12,
            branchStrengthAfterTrunkDeath: 0.25,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 35,
            loss: 0.008,
            baseLoss: 0.09,
            minSleep: 10,
            branchLoss: 0.8,
            mainLoss: 0.7,
            speed: 0.25,
            newBranch: 0.25,
            leaves: 0.65,
            leafSize: 1.4,
            downyLeaves: true,
            downyCoefficient: 3.5,
            treeColor: 'rgba(230, 10, 10, 1)',
            leafColor: 'rgba(100,100,0,1)',
            worth: 2.5,
            initialWidth: 10,
        },
    CherryBlossom:
        {
            upwardTendency: 0.1,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 36,
            loss: 0.02,
            baseLoss: 0.009,
            minSleep: 10,
            branchLoss: 0.9,
            mainLoss: 0.7,
            speed: 0.55,
            newBranch: 0.55,
            leaves: 0.25,
            leafSize: 0.7,
            downyLeaves: false,
            downyCoefficient: 3.5,
            maxLife: 90,
            treeColor: 'rgba(80, 30, 8, 1)',
            leafColor: 'rgba(230,100, 190,1)',
            worth: 3.7,
            initialWidth: 10,
        },
    DesertWeed:
        {
            upwardTendency: 0.07,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 40,
            loss: 0.02,
            baseLoss: 0.0001,
            minSleep: 10,
            branchLoss: 0.9,
            mainLoss: 0.7,
            speed: 0.25,
            newBranch: 0.55,
            leaves: 0.98,
            leafSize: 0.9,
            downyLeaves: true,
            downyCoefficient: 1.5,
            treeColor: 'rgba(200, 93, 80, 1)',
            leafColor: 'rgba(200,255,2,1)',
            worth: 3.7,
            initialWidth: 10,
        },
    Bamboo:
        {
            upwardTendency: 0,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 40,
            loss: 0.02,
            baseLoss: 0.0119,
            minSleep: 10,
            branchLoss: 0.2,
            mainLoss: 0.97,
            speed: 0.3,
            newBranch: 0.80,
            leaves: 0.45,
            leafSize: 0.7,
            downyLeaves: true,
            downyCoefficient: 3.5,
            maxLife: 70,
            treeColor: 'rgba(100, 193, 80, 1)',
            leafColor: 'rgba(0,255,0,1)',
            worth: 1.5,
            initialWidth: 10,
        },
    Crabgrass:   // 0.15
        {
            upwardTendency: 0.12,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 40,
            loss: 0.003,
            baseLoss: 0.0009,
            minSleep: 10,
            branchLoss: 0.6,
            mainLoss: 0.7,
            speed: 0.25,
            newBranch: 0.55,
            leaves: 0.90,
            leafSize: 2,
            downyLeaves: true,
            downyCoefficient: 4.5,
            treeColor: 'rgba(12,190,32,1)',
            leafColor: 'rgba(130, 193, 80, 1)',
            worth: 0.8,
            initialWidth: 10,
        },
    Yucca: // 0.50
        {
            upwardTendency: 0.12,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0.90,
            heightBeforeBranchingBasedOnHeight: 289,
            lifeBeforeLeafing: 30,
            loss: 0.02,
            baseLoss: 0.0009,
            minSleep: 10,
            branchLoss: 0.9,
            mainLoss: 0.00001,
            speed: 0.3,
            newBranch: 0.3,
            leaves: 0.00001,
            downyLeaves: false,
            downyCoefficient: 3.5,
            maxLife: 75,
            treeColor: 'rgba(230, 173, 160, 1)',
            leafColor: 'rgba(140,255,140,1)',
            worth: 1.8,
            initialWidth: 15,
            leafSize: 3.4,
            leafType: 'thin',
            leafSharpness: 8,
            leafThickness: 8,
        },
    NorfolkPine: // 2.50
        {
            upwardTendency: 0.12,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 25,
            loss: 0.02,
            baseLoss: 0.1,
            minSleep: 10,
            branchLoss: 0.1,
            mainLoss: 0.97,
            speed: 0.3,
            newBranch: 0.1,
            leaves: 0.05,
            downyLeaves: true,
            downyCoefficient: 3.5,
            maxLife: 170,
            treeColor: 'rgba(130, 73, 60, 1)',
            leafColor: 'rgba(40,125,40,1)',
            worth: 2.5,
            initialWidth: 10,
            leafType: 'thin',
            leafSize: 33.4,
            leafThickness: 3,
        },
    Porcini: //7.20
        {
            upwardTendency: -0.07,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 9,
            lifeBeforeLeafing: 20,
            loss: 0.007,
            baseLoss: 0.0007,
            minSleep: 10,
            branchLoss: 0.79,
            mainLoss: 0.9,
            speed: 0.025,
            newBranch: 0.3,
            leaves: 0.9,
            downyLeaves: true,
            downyCoefficient: 1.5,
            maxLife: 200,
            treeColor: 'rgba(120, 113, 80, 1)',
            leafColor: 'rgba(200,205,2,1)',
            worth: 3.7,
            maxValue: 50,
            initialWidth: 10,
            leafSize: 7,
            leafThickness: 8,
            leafType: 'mushroom',
        },
    Blackthorn: // 1.20
        {
            upwardTendency: 0,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 9,
            lifeBeforeLeafing: 20,
            loss: 0.007,
            baseLoss: 0,
            minSleep: 1,
            branchLoss: 0.36,
            mainLoss: 0.9,
            speed: 0.025,
            newBranch: 0.3,
            leaves: 1,
            downyLeaves: true,
            downyCoefficient: 1.5,
            treeColor: 'rgba(62, 73, 58, 1)',
            leafColor: 'rgba(200,205,2,1)',
            worth: 7,
            initialWidth: 10,
            leafSize: 7,
            leafThickness: 8,
            leafType: 'mushroom',
        },
    AloeVera: // 4.30
        {
            upwardTendency: -0.012,
            tendencyAffectsMainBranch: true,
            branchStrengthAfterTrunkDeath: 0.2,
            heightBeforeBranchingBasedOnWidth: 0,
            heightBeforeBranchingBasedOnHeight: 59,
            lifeBeforeLeafing: 25,
            loss: 0.19,
            baseLoss: 0.2,
            minSleep: 10,
            branchLoss: 0.05,
            mainLoss: 0.97,
            speed: 0.3,
            newBranch: 0.81,
            leaves: 0.01,
            downyLeaves: true,
            downyCoefficient: 3.5,
            maxLife: 400,
            mainBranches: 5,
            extraBranches: 6,
            treeColor: 'rgba(10, 73, 60, 1)',
            leafColor: 'rgba(4,125,40,1)',
            worth: 1.8,
            initialWidth: 12,
            leafType: null,
            leafSize: 1.4,
            leafThickness: 1,
            openStrength: 0.1,
            openTillLife: 15,
        },
};