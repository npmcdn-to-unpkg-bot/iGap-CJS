/**
 * Factories
 * Created by iGapWeb on 24/07/2016.
 */
angular.module('iGap.factories', [])
/**
 * iGApi  handle every method for connect to server and send message and recived messages
 * @param $rootScope
 * @param $timeout
 * @param iGEvent
 */
    .factory('iGApi', function ($rootScope, $timeout, iGEvent, $q) {
        /**
         * @param actionId
         * @param params
         */
        function invoke(actionId, params) {
            var deferred = $q.defer();
            wrapper = getRequestWrapper(actionId, params)
            if (wrapper !== false) {
                return sendRequest(wrapper)
            } else {
                console.log('actionName is undefined', actionId)
                deferred.reject()
            }
            return deferred.promise
        }

        /**
         * Send request
         * @returns {*}
         */
        function sendRequest() {
            var deferred = $q.defer();
            if (!ProcessRequestQueueRunned) {
                ProcessRequestQueueRunned = true
                $timeout(processRequestQueue, Config.timeOutDelay)
            }

            var random = randomString(10);
            if (arguments.length == 1) {
                var RequestWrapper = arguments[0];
                return prepareRequest(RequestWrapper, random)
            } else if (arguments.length > 1) {
                var relation = []
                var all = []
                for (var i = 0; i < arguments.length; i++) {
                    relation[i] = false
                    var RequestWrapper = arguments[i];
                    all[i] = prepareRequest(RequestWrapper, random + '.' + i)
                }
                window.requestQueueRelation[random] = relation
                return $q.all(all)
            }

            return deferred.promise
        }

        /**
         * prepareRequest
         * @param RequestWrapper
         * @param random
         */
        function prepareRequest(RequestWrapper, random) {
            var deferred = $q.defer();
            if (Config.Modes.debugMode)
                console.log('prepareRequest', RequestWrapper.actionId, RequestWrapper.ProtoObject);

            if (!isSecure && Config.unSecureMethods[RequestWrapper.actionId] === undefined) {
                sendMessageQueue.push({
                    RequestWrapper: RequestWrapper,
                    random: random
                })
                deferred.resolve()
                return deferred.promise
            }

            window.requestQueue[random] = RequestWrapper;

            if (RequestWrapper.ProtoObject.hasOwnProperty('request')) {
                RequestWrapper.ProtoObject.setRequest(new root.Request(random))
            } else {
                console.log('noRequest');
            }

            // console.log('request',random);
            var pack = packMessage(RequestWrapper.actionId, RequestWrapper.ProtoObject.toArrayBuffer())

            if (isSecure)
                pack = aesEncrypt(pack)

            return sendMessage(pack);
        }

        /**
         * packMessage Message
         * @param actionId
         * @param payload
         * @returns {*}
         */
        function packMessage(actionId, payload) {
            var action = new ArrayBuffer(2)
            var actionDv = new DataView(action, 0, 2)
            actionDv.setUint16(0, actionId, true);

            var joined = new Uint8Array(2 + payload.byteLength)
            joined.set(new Uint8Array(actionDv.buffer), 0)
            joined.set(new Uint8Array(payload), 2)

            return joined.buffer
        }

        /**
         * Send Message throw webSocket
         * @param pack
         */
        function sendMessage(pack) {
            var deferred = $q.defer();
            if (isConnect) {
                $rootScope.requestMessage++
                return webSocket.send(pack)
            } else {
                deferred.reject()
                console.log('sendMessage failed:`Connection closed`')
            }
            return deferred.promise
        }

        /**
         * send messages in queue
         */
        function sendQueue() {

            for (var i = 0; i < window.sendMessageQueue.length; i++) {
                obj = sendMessageQueue.pop()
                prepareRequest(obj.RequestWrapper, obj.random)
            }
        }

        /**
         * Handle request Message
         * @param message
         */
        function handleMessage(message) {
            if (isSecure) {
                var decrypt = aesDecrypt(message)
                if (decrypt)
                    message = decrypt
            }
            var ProtoObject;
            var actionId = message.slice(0, 2);
            var payload = message.slice(2, message.length);
            var dv = new DataView(actionId, 0, 2);
            actionId = dv.getUint16(0, true)
            var ActionName = Config.LookupTable[actionId];
            if (ActionName !== undefined) {
                try {
                    ProtoObject = root[ActionName].decode(payload);
                } catch (e) {
                    if (e.decoded) { // Truncated
                        myMessage = e.decoded; // Decoded message with missing required fields
                        log(myMessage)
                    } else {
                        // General error
                        console.log(dT(), 'Error On Decode ActionName', ActionName);
                    }
                }
                processResponse(actionId, ProtoObject)
            } else {

                //TODO
                log('ActionName is undefined', actionId)
            }
        }

        /**
         * check response message if error response trigger error event , if success triggr new response event
         * if no request trigger new response
         * @param actionId
         * @param protoObject
         */
        function processResponse(actionId, protoObject) {
            if (Config.Modes.debugMode)
                console.log('processResponse', actionId, protoObject)
            // todo every response have
            if (protoObject.response !== undefined && protoObject.response.id !== null && protoObject.response.id !== "") {
                // console.log('response',actionId,protoObject.response.id)

                var requestId = protoObject.response.id;
                if (requestQueue[requestId] === undefined)
                    return;

                if (actionId == 0) {// error
                    dotPosition = requestId.indexOf('.');
                    if (dotPosition != -1) {

                        randomId = requestId.substring(0, dotPosition)
                        indexId = requestId.substring(dotPosition + 1)
                        currentQueue = requestQueueRelation[randomId]
                        if (currentQueue !== undefined) {
                            delete requestQueueRelation[randomId]
                            for (var i = 0; i < currentQueue.length; i++) {
                                var actionWrapper = requestQueue[randomId + '.' + i]
                                if (actionWrapper !== undefined) {
                                    delete requestQueue[randomId + '.' + i]
                                    actionId = actionWrapper.actionId + Config.lookupTableResponseOffset
                                    if (indexId != i) {
                                        timeStmp = parseInt(Date.now() / 1000)
                                        var Response = new root.Response(randomId + '.' + i, timeStmp);
                                        currentProtoObject = new root.ErrorResponse(Response,
                                            Config.errorRelationResponseCode[0],
                                            Config.errorRelationResponseCode[1]);
                                    } else
                                        var currentProtoObject = protoObject

                                    wrapper = getResponseWrapper(actionId, currentProtoObject)
                                    wrapper.initializeId = actionWrapper.initializeId
                                    iGEvent.triggerError(wrapper)
                                }
                            }
                        }
                    }
                    else {
                        actionId = requestQueue[requestId].actionId + Config.lookupTableResponseOffset
                        wrapper = getResponseWrapper(actionId, protoObject)
                        wrapper.initializeId = requestQueue[requestId].initializeId
                        delete requestQueue[requestId]
                        iGEvent.triggerError(wrapper)
                    }
                }
                else {// success

                    var dotPosition = requestId.indexOf('.');
                    wrapper = getResponseWrapper(actionId, protoObject)
                    wrapper.initializeId = requestQueue[requestId].initializeId
                    if (dotPosition == -1) {
                        delete requestQueue[requestId]
                        iGEvent.trigger(wrapper)
                    } else {
                        var randomId = requestId.substring(0, dotPosition)
                        var indexId = requestId.substring(dotPosition + 1)
                        var currentQueue = requestQueueRelation[randomId]

                        if (currentQueue !== undefined) {
                            requestQueueRelation[randomId][indexId] = wrapper
                            runHandler = true
                            for (var i = 0; i < currentQueue.length; i++) {
                                if (currentQueue[i] === false) {
                                    runHandler = false
                                    break
                                }
                            }
                            if (runHandler) {
                                currentQueue = requestQueueRelation[randomId]
                                delete requestQueueRelation[randomId]
                                for (var i = 0; i < currentQueue.length; i++) {
                                    wrapper = currentQueue[i]
                                    delete requestQueue[randomId + '.' + i]
                                    iGEvent.trigger(wrapper)
                                }
                            }
                        }
                    }
                }
            }
            else { // no request
                if (actionId == 0) {

                } else {
                    var wrapper = getResponseWrapper(actionId, protoObject)
                    iGEvent.trigger(wrapper)
                }
            }


        }

        /**
         * check request queue for request timeout
         */
        function processRequestQueue() {
            var ObjectKeys = Object.keys(requestQueue);
            for (var i = 0; i < ObjectKeys.length; i++) {
                if (requestQueue[ObjectKeys[i]] !== undefined && requestQueue[ObjectKeys[i]].time + Config.timeOut < Date.now()) {
                    var dotPosition = ObjectKeys[i].indexOf('.');
                    if (dotPosition != -1) {
                        var requestId = ObjectKeys[i].substring(0, dotPosition)
                        if (requestQueueRelation[requestId] !== undefined) {
                            for (var j = 0; j < requestQueueRelation[requestId].length; j++) {
                                timeOutRequest(requestId + '.' + j)
                                delete requestQueue[requestId + '.' + j]
                            }
                            delete requestQueueRelation[requestId];
                        }
                    } else {
                        timeOutRequest(ObjectKeys[i]);
                        delete requestQueue[ObjectKeys[i]]
                    }
                }
            }
            if (Object.keys(requestQueue).length > 0)
                $timeout(processRequestQueue, Config.timeOutDelay)
            else
                ProcessRequestQueueRunned = false;

            // console.log('requestQueue',requestQueue);
        }

        /**
         * when a request time out
         * @param id
         */
        function timeOutRequest(id) {
            var wrapper = requestQueue[id]
            if (wrapper !== undefined) {
                timStmp = parseInt(Date.now() / 1000)
                var Response = new root.Response(id, timStmp);
                var ErrorResponse = new root.ErrorResponse(Response, Config.errorNoResponseCode[0], Config.errorNoResponseCode[1]);
                var errorWrapper = getResponseWrapper(wrapper.actionId, ErrorResponse)
                iGEvent.triggerTimeOut(wrapper.actionId + Config.lookupTableResponseOffset, errorWrapper)
            }
        }

        /**
         * get message response wrapper
         * @param actionId
         * @param ProtoObject
         * @returns {Object}
         */
        function getResponseWrapper(actionId, ProtoObject) {
            var wrapper = angular.extend({}, window.handlerWrapperClass)
            wrapper.actionId = actionId;
            wrapper.ProtoObject = ProtoObject
            return wrapper
        }

        /**
         * get message response wrapper
         * @param actionId
         * @param params
         * @param eventId
         * @returns {Object}
         */
        function getRequestWrapper(actionId, params, eventId) {
            var actionName = Config.LookupTable[actionId];
            if (actionName !== undefined) {

                var proto = new root[actionName]();
                objKeys = Object.keys(params)
                for (var i = 0; i < objKeys.length; i++) {
                    property = objKeys[i]
                    proto.$set(property, params[property])
                }

                var wrapper = angular.extend({}, window.requestWrapperClass)
                wrapper.actionId = actionId;
                wrapper.ProtoObject = proto
                wrapper.eventId = eventId
                wrapper.time = Date.now();

                return wrapper
            }
            return false
        }

        return {
            invoke: invoke,
            sendRequest: sendRequest,
            sendQueue: sendQueue,
            handleMessage: handleMessage,
            getRequestWrapper: getRequestWrapper
        }
    })

    /**
     * iGEvent manage Events
     * @param $rootScope
     */
    .factory('iGEvent', function ($rootScope, $q) {
        /**
         * trigger resolve event
         * @param wrapper
         */
        function trigger(wrapper) {
            $rootScope.$broadcast('iGE_' + wrapper.actionId, wrapper)
        }

        /**
         * trigger Error event
         * @param wrapper
         */
        function triggerError(wrapper) {
            $rootScope.$broadcast('iGE_' + wrapper.actionId + '_error', wrapper)
        }

        /**
         * trigger TimeOut Event
         * @param actionId
         * @param wrapper
         */
        function triggerTimeOut(actionId, wrapper) {
            console.log('actionId TimeOut', actionId)
            $rootScope.$broadcast('iGE_' + actionId + '_timeOut', wrapper)
        }

        /**
         *
         * @param actionId
         * @param handle
         * @param error
         * @param timeOut
         */
        function on(actionId, handle, error, timeOut) {
            var deferred = $q.defer()
            /**
             * Resolve onSuccess Event
             */
            eventName = 'iGE_' + actionId
            delete $rootScope.$$listeners[eventName]
            $rootScope.$on(eventName, function (event, Obj) {
                if (handle !== undefined)
                    handle(Obj)
                Obj.type = 'success'
                deferred.resolve(Obj)
            })

            /**
             * Reject onError Event
             */
            errorEventName = eventName + '_error'
            delete $rootScope.$$listeners[errorEventName]
            $rootScope.$on(errorEventName, function (event, Obj) {
                if (error !== undefined)
                    error(Obj)

                Obj.type = 'error'
                deferred.resolve(Obj)
            })

            /**
             * Reject onTimeOut Event
             */
            timeOutEventName = eventName + '_timeOut'
            delete $rootScope.$$listeners[timeOutEventName]
            $rootScope.$on(timeOutEventName, function (event, Obj) {
                console.log('timeOutEventName', timeOutEventName, timeOut);
                if (timeOut === undefined) {
                    if (error !== undefined)
                        error(Obj);
                } else
                    timeOut(Obj)

                Obj.type = 'timeOut'
                deferred.resolve(Obj)
            })
            return deferred.promise
        }

        return {
            triggerTimeOut: triggerTimeOut,
            triggerError: triggerError,
            trigger: trigger,
            on: on
        }
    })
