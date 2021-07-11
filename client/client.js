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

on('onClientResourceStart', (name) => {
    if (name != GetCurrentResourceName())
        return;

    for (let location of config.locations) {
        let modelHash = GetHashKey(location.shopkeeperPed);
        let exec = async function() {
            if (!MRP_CLIENT.isPedNearCoords(location.x, location.y, location.z, null, modelHash)) {
                console.log(`Add PED for location [${location.id}]`);
                RequestModel(modelHash);
                while (!HasModelLoaded(modelHash)) {
                    await utils.sleep(100);
                }

                shopPed = CreatePed(GetPedType(location.shopkeeperPed), location.shopkeeperPed, location.x, location.y, location.z, location.heading, true, true);
                mySpawns[location.id] = shopPed;
                SetBlockingOfNonTemporaryEvents(shopPed, true);
                SetPedKeepTask(shopPed, true);
                SetPedDropsWeaponsWhenDead(shopPed, false);
                SetPedFleeAttributes(shopPed, 0, 0);
                SetPedCombatAttributes(shopPed, 17, 1);
                SetPedSeeingRange(shopPed, 0.0);
                SetPedHearingRange(shopPed, 0.0);
                SetPedAlertness(shopPed, 0.0);
                SetEntityInvincible(shopPed, true);
            }
        };
        exec();
    }
});

setInterval(() => {
    for (let location of config.locations) {
        let ped = PlayerPedId();
        let modelHash = GetHashKey(location.shopkeeperPed);
        if (MRP_CLIENT.isNearLocation(ped, location.x, location.y, location.z) && MRP_CLIENT.isPedNearCoords(location.x, location.y, location.z, null, modelHash)) {
            //check if looking at shop keeper
            let pedInFront = MRP_CLIENT.getPedInFront();
            if (pedInFront > 0) {
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