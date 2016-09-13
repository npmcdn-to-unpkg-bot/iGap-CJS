/**
 * Controllers
 * Created by iGapWeb on 24/07/2016.
 */

angular.module('iGap.controllers', [])

    .controller('AppController', function () {

    })
    .controller('AppIGController', function (iGApi, iGEvent) {
        console.log('location on')
        iGApi.invoke(Config.ActionMap.InfoTime, {}).then(function () {
            iGEvent.on(Config.ActionMap.InfoTimeResponse,
                function (proto) {
                    console.log(dT(), 'success', 'InfoTimeResponse proto', proto);
                },
                function (proto) {
                    console.log(dT(), 'error', 'InfoTimeResponse proto', proto);
                })
                .then(function (proto) {
                    console.log(dT(), 'after', 'InfoTimeResponse proto', proto);
                })
        })
    })