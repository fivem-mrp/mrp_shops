MRP_CLIENT = null;

emit('mrp:vehicle:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

configFile = LoadResourceFile(GetCurrentResourceName(), 'config/client.json');

config = JSON.parse(configFile);

let shopPed = null;
let mySpawns = {};
setInterval(() => {
    for (let location of config.locations) {
        let ped = PlayerPedId();
        if (MRP_CLIENT.isNearLocation(ped, location.x, location.y, location.z) && !mySpawns[location.id]) {
            //is near spawn NPC
            shopPed = CreatePed(GetPedType(location.shopkeeperPed), location.shopkeeperPed, location.x, location.y, location.z, location.heading, true, true);
            mySpawns[location.id] = shopPed;
            SetPedKeepTask(shopPed, true);
            SetPedDropsWeaponsWhenDead(shopPed, false);
            SetPedFleeAttributes(shopPed, 0, 0);
            SetPedCombatAttributes(shopPed, 17, 1);
            SetPedSeeingRange(shopPed, 0.0);
            SetPedHearingRange(shopPed, 0.0);
            SetPedAlertness(shopPed, 0.0);
        } else if (!MRP_CLIENT.isNearLocation(ped, location.x, location.y, location.z) && mySpawns[location.id]) {
            //spawned ped before remove
            SetEntityAsNoLongerNeeded(myspawns[location.id], true);
            delete myspawns[location.id];
        }
    }
}, 0);