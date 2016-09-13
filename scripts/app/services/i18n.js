/**
 * i18n
 * Created by iGapWeb on 24/07/2016.
 */


angular.module('iGap.i18n', [])

    .factory('_', [function () {
        var locale = Config.I18n.locale
        var messages = Config.I18n.messages
        var fallbackMessages = Config.I18n.fallback_messages

        function _(msgid) {
            if (messages.hasOwnProperty(msgid)) {
                return messages[msgid]
            } else if (fallbackMessages.hasOwnProperty(msgid)) {
                console.warn('[i18n] missing locale key ' + locale + ' / ' + msgid)
                return fallbackMessages[msgid]
            } else {
                console.log('[i18n] missing key ' + msgid)
                return msgid
            }
        }

        _.locale = function () {
            return locale
        }
        return _
    }])

    .directive('igI18n', ['_', function (_) {
        return {
            restrict: 'EA',
            // replace: 'true',
            compile: function (element) {
                var format = angular.element(element)
                var msgid = format.attr('ig-i18n') || format.attr('msgid') || format.attr('ig-i18n-format')
                    || format.html().replace(/\s+/g, ' ').trim()
                var msgstr = _(msgid)
                format.html(msgstr)
            }
        }
    }])
