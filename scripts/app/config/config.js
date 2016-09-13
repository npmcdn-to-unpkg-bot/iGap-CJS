/**
 * Config
 * Created by iGapWeb on 24/07/2016.
 */
Config = window.Config || {}

Config.sendSize = 0
Config.Modes = {
    debugMode: true,
    autoRetry: true,
    loginRequire: true,
    animations: true,
    memory_only: false
}

Config.loginRequire = false

// socket
Config.socketUrl = 'wss:// or ws://';

Config.timeOut = 10000;
Config.timeOutDelay = 3000;
Config.errorNoResponseCode = [5, 1];
Config.errorRelationResponseCode = [6, 0];
Config.lookupTableResponseOffset = 30000;

//connection
Config.connectionStatus = {
    secure: 'secure',
    online: 'online',
    offline: 'offline',
    connecting: 'connecting',
    error: 'error'
}

//event
Config.recivedMessageEvent = 'iGRecivedMessageEvent'
Config.sendMessageEvent = 'iGSendMessageEvent'
Config.initEvent = 'initEvent'

//proto
Config.protoBufLocation = 'scripts/app/proto/'
Config.protoClass = [
    'ConnectionSecuring.proto',
    'Error.proto',
    'Request.proto',
    'Response.proto',
    'InfoTime.proto'
]

Config.ActionMap = {
    // < 100
    ErrorResponse: 0,
    ConnectionSecuringResponse: 30001,
    ConnectionSymmetricKey: 2,
    ConnectionSymmetricKeyResponse: 30002,

    // 500
    InfoTime: 502,
    InfoTimeResponse: 30502,
}

// methods
Config.unSecureMethods = []
Config.unSecureMethods[Config.ActionMap.ConnectionSymmetricKey] = true

Config.LookupTable = {}
// < 100
Config.LookupTable[Config.ActionMap.ErrorResponse] = 'ErrorResponse'
Config.LookupTable[Config.ActionMap.ConnectionSecuringResponse] = 'ConnectionSecuringResponse'
Config.LookupTable[Config.ActionMap.ConnectionSymmetricKey] = 'ConnectionSymmetricKey'
Config.LookupTable[Config.ActionMap.ConnectionSymmetricKeyResponse] = 'ConnectionSymmetricKeyResponse'
//500
Config.LookupTable[Config.ActionMap.InfoTime] = 'InfoTime'
Config.LookupTable[Config.ActionMap.InfoTimeResponse] = 'InfoTimeResponse'

// server Error number
Config.Error = {
    1: 'ERROR_BAD_REQUEST',
    2: 'ERROR_LOGIN_REQUIRED',
    3: 'ERROR_NEW_CLIENT_IN_SESSION',
    4: 'ERROR_FORBIDDEN',
    5: 'ERROR_TIMEOUT',
    6: 'ERROR_RELATION_ERROR',
    100: {
        0: 'ERROR_USER_REGISTER_BAD_PAYLOAD',
        1: 'ERROR_INVALID_COUNTRYCODE',
        2: 'ERROR_INVALID_PHONENUMBER'
    },
    101: 'ERROR_USER_REGISTER_INTERNAL_SERVER_ERROR',
    102: {
        0: 'ERROR_USER_VERIFY_BAD_PAYLOAD',
        1: 'ERROR_INVALID_CODE',
        2: 'ERROR_INVALID_USERNAME',
        3: 'ERROR_INVALID_DEVICE',
        4: 'ERROR_INVALID_OSNAME',
        5: 'ERROR_INVALID_OSVERSION'
    },
    103: 'USER_VERIFY_INTERNAL_SERVER_ERROR'
}


//language
Config.I18n = {
    locale: 'en-us',
    supported: [
        'en-us'
    ],
    languages: {
        'en-us': 'English',
    },
    aliases: {
        'en': 'en-us',
    },
    messages: {},
    fallback_messages: {}
}