/**
 * Created by PC on 23/07/2016.
 */
var app = angular.module("iGap",
    [
        'ngRoute',
        'ngAnimate',
        'ngWebSocket',
        'ngSanitize',
        'iGap.i18n',
        'iGap.router',
        'iGap.service',
        'iGap.filters',
        'iGap.directives',
        'iGap.factories',
        'iGap.controllers',
    ])
    .run(function (iGNetwork, iGInit) {
        iGNetwork.Connect()
            .then(function () {
                iGInit.init()

            })
    })