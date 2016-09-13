/**
 * Services
 * Created by iGapWeb on 24/07/2016.
 */

angular.module('iGap.service', [])

/**
 * @param $rootScope
 * @param $location
 * @param iGEvent
 */
    .service('iGInit', function ($rootScope, $location, iGEvent, iGApi, $q) {
        this.init = function () {
            secureInit()
            initEvents()
        }

        function secureInit() {
            iGEvent.on(Config.ActionMap.ConnectionSecuringResponse, setSecure)
            /**
             * @param Rproto
             */
            function setSecure(Rproto) {
                if (havePublickKey)
                    return;

                havePublickKey = true
                proto = Rproto.ProtoObject
                publicKey = forge.pki.publicKeyFromPem(proto.getPublicKey());
                window.symetricKey = randomString(proto.getSymmetricKeyLength())
                return iGApi.invoke(Config.ActionMap.ConnectionSymmetricKey, {
                    symmetricKey: strToArrayBuf(publicKey.encrypt(symetricKey))
                }).then(function () {
                    iGEvent.on(Config.ActionMap.ConnectionSymmetricKeyResponse,
                        setSymmetricKey,
                        function () {
                            setSecure(Rproto)
                        })
                })
            }

            /**
             * Set Symmetric Key OPTIONS
             * @param proto
             */
            function setSymmetricKey(proto) {

                var deferred = $q.defer();
                proto = proto.ProtoObject
                if (proto.getStatus() == root.ConnectionSymmetricKeyResponse.Status.ACCEPTED) {
                    window.isSecure = true
                    window.symetricIvSize = proto.getSymmetricIvSize()
                    syMetSize = proto.getSymmetricMethod().split('-')
                    window.symetricMethod = syMetSize[0] + '-' + syMetSize[2]
                    window.symetricMethodtagLength = syMetSize[1]
                    console.log('secure is on')
                    $location.url('iG')
                    deferred.resolve()
                } else {
                    console.log('connection not secure');
                    $rootScope.closeConnection()
                    deferred.reject()
                }
                return deferred.promise
            }
        }

        /**
         * init messages Events
         */
        function initEvents() {
        }
    })

    /**
     * @param $websocket
     * @param $rootScope
     * @param iGApi
     * @param $timeout
     * @param $interval
     */
    .service('iGNetwork', function ($websocket, $rootScope, iGApi, $timeout, $q) {
        /**
         * try to connect to server
         * @constructor
         */
        function Connect() {
            var deferred = $q.defer();
            if ($rootScope.connectionStatus == Config.connectionStatus.online)
                return;

            window.webSocket = $websocket(Config.socketUrl, undefined, {binaryType: 'arraybuffer'});
            webSocket.onMessage(function (message) {
                $rootScope.responseMessage++
                iGApi.handleMessage(message.data)
            });
            webSocket.onError(function () {
                $rootScope.connectionStatus = Config.connectionStatus.offline;
                isLogin = false
                isSecure = false
                isConnect = false
                havePublickKey = false
                deferred.reject();
            })
            webSocket.onOpen(function () {
                console.log(dT(), 'Connection Open');
                $rootScope.connectionStatus = Config.connectionStatus.online;
                $rootScope.responseMessage = 0
                $rootScope.requestMessage = 0
                isConnect = true
                checkPk()
                deferred.resolve();
            })
            webSocket.onClose(function () {
                console.log('Connection Close');
                isLogin = false
                isSecure = false
                isConnect = false
                havePublickKey = false
                $rootScope.connectionStatus = Config.connectionStatus.offline
                if (Config.Modes.autoRetry)
                    $timeout(function () {
                        console.log('retry to connect ...')
                        Connect()
                    }, 5000)
            })

            /**
             * @param i
             */
            function checkPk(i) {
                if (i === undefined)
                    var i = 0
                if (!havePublickKey) {
                    if (i <= 3) {
                        console.log('send', i);
                        webSocket.send('')
                        $timeout(function () {
                            checkPk(i++)
                        }, 2000)
                    }
                }
            }

            return deferred.promise
        }

        /**
         * Disconnect websocket Connection
         * @constructor
         */
        function Disconnect() {
            if ($rootScope.connectionStatus == Config.connectionStatus.online) {
                window.webSocket.close()
            }
        }

        return {
            Connect: Connect,
            Disconnect: Disconnect,
        }
    })

    /**
     *
     */
    .provider('Storage', function () {
        this.setPrefix = function (newPrefix) {
            ConfigStorage.prefix(newPrefix)
        }

        this.$get = ['$q', function ($q) {
            var methods = {}
            angular.forEach(['get', 'set', 'remove', 'clear'], function (methodName) {
                methods[methodName] = function () {
                    var deferred = $q.defer()
                    var args = Array.prototype.slice.call(arguments)

                    args.push(function (result) {
                        deferred.resolve(result)
                    })
                    ConfigStorage[methodName].apply(ConfigStorage, args)

                    return deferred.promise
                }
            })

            methods.noPrefix = function () {
                ConfigStorage.noPrefix()
            }

            return methods
        }]
    })
