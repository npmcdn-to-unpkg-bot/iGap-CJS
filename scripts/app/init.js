/**
 * Created by PC on 24/07/2016.
 */

// var webSocket = null;
;(function initApplication() {

    window.recivedMessageQueue = []
    window.sendMessageQueue = []
    window.requestQueue = {}
    window.requestQueueRelation = {}
    window.ProcessRequestQueueRunned = false
    window.requestWrapperClass = {
        actionId: 0,
        ProtoObject: null,
        time: 0,
        initializeId: 0
    }
    window.handlerWrapperClass = {
        actionId: 0,
        ProtoObject: null,
        initializeId: 0
    }

    //encryption
    window.isConnect = false
    window.isSecure = false
    window.havePublickKey = false
    window.symetricKey = null
    window.symetricIvSize = null
    window.symetricMethod = null
    window.symetricMethodtagLength = null


    // initialize language
    var defaultLocale = 'en-us'
    $.getJSON('scripts/app/locales/' + Config.I18n.locale + '.json').success(function (json) {
        Config.I18n.messages = json
    })

    if (Config.I18n.locale != defaultLocale) {
        $.getJSON('scripts/app/locales/' + defaultLocale + '.json').success(function (json) {
            Config.I18n.fallback_messages = json
        })
    }
    if (typeof dcodeIO === 'undefined' || !dcodeIO.ProtoBuf) {
        throw(new Error("ProtoBuf.js is not present. Please see www/index.html for manual setup instructions."));
    }
// Initialize ProtoBuf.js
    var ProtoBuf = dcodeIO.ProtoBuf;
    var builder = ProtoBuf.newBuilder({convertFieldsToCamelCase: true});
    for (var i = 0; i < Config.protoClass.length; i++) {
        // console.log( 'Config.protoClass[i]', Config.protoClass[i]);
        ProtoBuf.loadProtoFile(Config.protoBufLocation + Config.protoClass[i], builder);
    }
    window.root = builder.build('proto');

})()



