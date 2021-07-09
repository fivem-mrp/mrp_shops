MRP_CLIENT = null;

emit('mrp:vehicle:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

eval(LoadResourceFile('mrp_core', 'client/helpers.js'));

configFile = LoadResourceFile(GetCurrentResourceName(), 'config/config.json');

config = JSON.parse(configFile);

if (config.showBlips) {
    MRP_CLIENT.addBlips(config.locations);
}

let shopPed = null;
let mySpawns = {};
setInterval(() => {
    for (let location of config.locations) {
        let ped = PlayerPedId();
        if (MRP_CLIENT.isNearLocation(ped, location.x, location.y, location.z) && !mySpawns[location.id]) {
            let exec = async function() {
                console.log(`Add PED for location [${location.id}]`);
                //is near spawn NPC
                let modelHash = GetHashKey(location.shopkeeperPed);
                RequestModel(modelHash);
                while (!HasModelLoaded(modelHash)) {
                    await utils.sleep(100);
                }

                shopPed = CreatePed(GetPedType(location.shopkeeperPed), location.shopkeeperPed, location.x, location.y, location.z, location.heading, true, true);
                mySpawns[location.id] = shopPed;
                SetPedKeepTask(shopPed, true);
                SetPedDropsWeaponsWhenDead(shopPed, false);
                SetPedFleeAttributes(shopPed, 0, 0);
                SetPedCombatAttributes(shopPed, 17, 1);
                SetPedSeeingRange(shopPed, 0.0);
                SetPedHearingRange(shopPed, 0.0);
                SetPedAlertness(shopPed, 0.0);
            }
            //this is not a PED but to prevent multiple spawns in same locaiton as the above is async and will overwrite this anyway
            mySpawns[location.id] = true;
            exec();
        } else if (!MRP_CLIENT.isNearLocation(ped, location.x, location.y, location.z) && mySpawns[location.id]) {
            console.log(`Remove PED for location [${location.id}]`);
            //spawned ped before remove
            SetEntityAsNoLongerNeeded(mySpawns[location.id], true);
            mySpawns[location.id] = null;
        }
    }
}, 0);