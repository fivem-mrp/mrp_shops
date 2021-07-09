const config = require('./config/config.json');

let localeConvar = GetConvar("mrp_locale", "en");
const locale = config.locale[localeConvar];

onNet('mrp:shops:server:open', (source, shopId) => {
    if (!shopId || !config.shopInventory[shopId]) {
        console.log(`Openning unknown shop [${shopId}]`);
        return;
    }

    //name, id, other
    let inventory = {
        items: config.shopInventory[shopId],
        label: locale[shopId]
    };

    emit('mrp:inventory:server:OpenInventory', 'shop', shopId, inventory, source);
});