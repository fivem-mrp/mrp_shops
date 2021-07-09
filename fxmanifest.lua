fx_version 'cerulean'
game 'gta5'

author 'mufty'
description 'MRP Shops'
version '0.0.1'

dependencies {
    "mrp_core"
}

files {
    'config/config.json',
}

client_scripts {
    '@mrp_core/shared/debug.js',
    'client/*.js',
}

server_scripts {
    '@mrp_core/shared/debug.js',
    'server/*.js',
}
