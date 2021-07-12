MRP_CLIENT = null;

emit('mrp:getSharedObject', obj => MRP_CLIENT = obj);

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

let currentLocation = null;

on('onClientResourceStart', (name) => {
    if (name != GetCurrentResourceName())
        return;

    for (let location of config.locations) {
        MRP_CLIENT.spawnSharedNPC({
            model: location.shopkeeperPed,
            x: location.x,
            y: location.y,
            z: location.z,
            heading: location.heading
        });
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