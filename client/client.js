MRP_CLIENT = null;

emit('mrp:vehicle:getSharedObject', obj => MRP_CLIENT = obj);

while (MRP_CLIENT == null) {
    print('Waiting for shared object....');
}

let localeConvar = GetConvar("mrp_locale", "en");

eval(LoadResourceFile('mrp_core', 'client/helpers.js'));

configFile = LoadResourceFile(GetCurrentResourceName(), 'config/config.json');

config = JSON.parse(configFile);

locale = config.locale[localeConvar];

if (config.showBlips) {
    MRP_CLIENT.addBlips(config.locations);
}

let shopPed = null;
let mySpawns = {};
let currentLocation = null;
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
            //this is not a PED but to prevent mulFratiple spawns in same locaiton as the above is async and will overwrite this anyway
            mySpawns[location.id] = true;
            exec();
        } else if (!MRP_CLIENT.isNearLocation(ped, location.x, location.y, location.z) && mySpawns[location.id] !== true && mySpawns[location.id] > 0) {
            console.log(`Remove PED for location [${location.id}]`);
            //spawned ped before remove
            //SetEntityAsNoLongerNeeded(mySpawns[location.id], true);
            DeleteEntity(mySpawns[location.id]); // delete instead of marking
            mySpawns[location.id] = null;
        }

        if (MRP_CLIENT.isNearLocation(ped, location.x, location.y, location.z) && mySpawns[location.id] !== true && mySpawns[location.id] > 0) {
            //check if looking at shop keeper
            let pedInFront = MRP_CLIENT.getPedInFront();
            if (pedInFront > 0 && mySpawns[location.id]) {
                emit('mrp:thirdeye:addMenuItem', {
                    locationId: location.id,
                    id: 'shop',
                    text: locale.open_shop,
                    action: 'https://mrp_shops/open'
                });
                currentLocation = location;
            } else {
                currentLocation = null;
                emit('mrp:thirdeye:removeMenuItem', {
                    id: 'shop'
                });
            }
        }
    }
}, 0);

RegisterNuiCallbackType('open');
on('__cfx_nui:open', (data, cb) => {
    cb({});
    if (!currentLocation)
        return;

    console.log('Open shop');

    emitNet('mrp:shops:server:open', GetPlayerServerId(PlayerId()), currentLocation.id);
});