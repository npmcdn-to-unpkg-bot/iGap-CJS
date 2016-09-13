/**
 * Utils
 * Created by iGapWeb on 24/07/2016.
 */

var _logTimer = (new Date()).getTime()
/**
 * get time
 * @returns {string}
 */
function dT() {
    return '[' + (((new Date()).getTime() - _logTimer) / 1000).toFixed(3) + ']'
}

/**
 *
 */
function log() {
    console.log(dT(), 'message', arguments)
}
/**
 * @param maxValue
 * @returns {number}
 */
function nextRandomInt(maxValue) {
    return Math.floor(Math.random() * maxValue)
}
/**
 *
 * @param length
 * @returns {string}
 */
function randomString(length) {
    var str = '';
    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
    var charsLen = chars.length;

    for (var i = 0; i < length; i++) {
        str += chars[~~(Math.random() * charsLen)];
    }
    return str;
}
/**
 *
 * @param str
 * @returns {string}
 */
function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
        return String.fromCharCode('0x' + p1);
    }));
}
/**
 *
 * @param blob
 */
function blobToArrayBuf(blob) {
    // Blob -> ArrayBuffer
    var uint8ArrayNew = null;
    var arrayBufferNew = null;
    var fileReader = new FileReader();
    fileReader.onload = function (progressEvent) {
        arrayBufferNew = this.result;
        uint8ArrayNew = new Uint8Array(arrayBufferNew);

        // warn if read values are not the same as the original values
        // arrayEqual from: http://stackoverflow.com/questions/3115982/how-to-check-javascript-array-equals
        function arrayEqual(a, b) {
            return !(a < b || b < a);
        };
        if (arrayBufferNew.byteLength !== arrayBuffer.byteLength) // should be 3
            console.warn("ArrayBuffer byteLength does not match");
        if (arrayEqual(uint8ArrayNew, uint8Array) !== true) // should be [1,2,3]
            console.warn("Uint8Array does not match");
    };
    fileReader.readAsArrayBuffer(blob);
    fileReader.result; // also accessible this way once the blob has been read
}

/**
 * get un safe string and encrypted with aes method
 * @param {ArrayBuffer} input
 * @returns {*}
 */
function aesEncrypt(input) {
    var offset = 0;
    var unit = 1024 * 4;
    var size = input.byteLength
    var iv = forge.random.getBytes(symetricIvSize);

    var cipher = forge.cipher.createCipher(symetricMethod, symetricKey);
    cipher.start({
        iv: iv,
        tagLength: symetricMethodtagLength
    });

    // cipher.update(forge.util.createBuffer(input, 'binary'));
    while (offset + unit <= size) {
        cipher.update(forge.util.createBuffer(input.slice(offset, offset + unit), 'binary'));
        offset += unit
    }
    if (offset < size) {
        cipher.update(forge.util.createBuffer(input.slice(offset, size), 'binary'));
    }
    cipher.finish();

    var output = iv + cipher.output.data;

    return strToArrayBuf(output)
}

/**
 * get encrypted bytes and return decrypted
 * @param {ArrayBuffer} input
 * @returns {*}
 */
function aesDecrypt(input) {
    try {
        var iv = input.slice(0, symetricIvSize);
        iv = arrayBufToStr(iv)
        var buffer = input.slice(symetricIvSize);
        var decipher = forge.cipher.createDecipher(symetricMethod, symetricKey);
        decipher.start({
            iv: iv,
            tagLength: symetricMethodtagLength
        });
        decipher.update(forge.util.createBuffer(buffer, 'binary'));
        decipher.finish();
        return strToArrayBuf(decipher.output.data);
    } catch (e) {
        return false;
    }
}
/**
 * @param str
 * @returns {Uint8Array}
 */
function toByte(str) {
    var bytes = new Uint8Array(str.length);
    for (var i = 0; i < str.length; i++)
        bytes[i] = str.charCodeAt(i);

    return bytes;
}
/**
 *
 * @param str
 * @returns {ArrayBuffer}
 */
function strToArrayBuf(str) {
    var arr = new Uint8Array(str.length);
    for (var i = str.length; i--;)
        arr[i] = str.charCodeAt(i);
    return arr.buffer;
}

/**
 *
 * @param buf
 * @returns {*}
 */
function arrayBufToStr(buf) {
    var offset = 0;
    var unit = 1024 * 64;
    var str = "";

    while (offset + unit <= buf.byteLength) {
        str += String.fromCharCode.apply(null, new Uint8Array(buf.slice(offset, offset + unit)))
        offset += unit
    }
    if (offset < buf.byteLength) {
        str += String.fromCharCode.apply(null, new Uint8Array(buf.slice(offset, buf.byteLength)))
    }
    return str;
}

/**
 * return arrayBuffer sha256 hashcode
 * @param {ArrayBuffer} buff
 * @returns {ArrayBuffer}
 */
function arrayBufHash(buff) {

    var offset = 0;
    var unit = 1024 * 64;
    var size = buff.byteLength
    var md = forge.md.sha256.create();

    while (offset + unit <= size) {
        md.update(arrayBufToStr(buff.slice(offset, offset + unit)));
        offset += unit
    }
    if (offset < size)
        md.update(arrayBufToStr(buff.slice(offset, size)));

    return strToArrayBuf(md.digest().getBytes())
}

function getSelectedText() {
    var sel = (
        window.getSelection && window.getSelection() ||
        document.getSelection && document.getSelection() ||
        document.selection && document.selection.createRange().text || ''
    ).toString().replace(/^\s+|\s+$/g, '')

    return sel
}

function getTime(stmp) {
    var date = new Date(stmp)
    return date.getHours() + ":" + date.getMinutes()
}
function tsNow(seconds) {
    var t = +new Date() + (window.tsOffset || 0)
    return seconds ? Math.floor(t / 1000) : t
}
/**
 * Delete item from array
 * @param array
 * @param indexToDelete
 * @returns {Array}
 */
function deleteFromArray(array, indexToDelete) {
    var remain = [];
    console.log(dT(), 'indexToDelete', indexToDelete);
    for (var i in array) {
        if (i == indexToDelete) {
            console.log(dT(), 'i', i);
            continue;
        }
        remain[i] = array[i];
    }
    return remain;
}

/**
 * getErrorMessage
 * @param major
 * @param minor
 * @returns {*}
 */
function getError(major, minor) {
    error = Config.Error[major]
    if (error !== undefined) {
        if (typeof error === "object") {
            if (minor === undefined)
                minor = 0
            return error[minor]
        } else if (typeof error === "string") {
            return error
        }
    }
    return 'error notFound : (' + major + ',', minor + ')'
}


