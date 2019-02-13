/* jshint ignore:start */
(function(){
"use strict";

var nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined' && window.setImmediate;
    var canPost = typeof window !== 'undefined' && window.postMessage && window.addEventListener;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        var tCount = 0;

        /**
         * modification of the original nexttick emulation. added counter and
         * tick-local queue. the effect is that all functions enqueued during
         * one stack are executed in one loop, but anything enqueued during
         * that loop will be executed in the next tick.
         */
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                // tCount++;
                if(queue.length > 0) {
                    if(window.__promise_disable_local_queue) {
                        fn = queue.shift();
                        fn();
                    } else {
                        var tQueue = queue;
                        queue = [];
                        while (tQueue.length > 0) {
                            var fn = tQueue.shift();
                            // console.log('*** promise '+tCount+': dequeue ('+tQueue.length+') *** ');
                            fn();
                        }
                    }
                }
            }
        }, true);

        return function nextTick(fn) {
            // console.log('*** promise '+tCount+': enqueue ('+queue.length+') *** ');
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();


window.Promise = function(fn) {
    // if (!(this instanceof Promise)) return new Promise(fn)
    if (typeof fn !== 'function') throw new TypeError('not a function')
    var state = null
    var delegating = false
    var value = null
    var deferreds = []
    var self = this

    this.then = function(onFulfilled, onRejected) {
        return new Promise(function(resolve, reject) {
            handle(new Handler(onFulfilled, onRejected, resolve, reject))
        })
    }

    function Handler(onFulfilled, onRejected, resolve, reject){
        this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
        this.onRejected = typeof onRejected === 'function' ? onRejected : null
        this.resolve = resolve
        this.reject = reject
    }

    function handle(deferred) {
        if (state === null) {
            deferreds.push(deferred)
            return
        }
        nextTick(function() {
            var cb = state ? deferred.onFulfilled : deferred.onRejected
            if (cb === null) {
                (state ? deferred.resolve : deferred.reject)(value)
                return
            }
            var ret
            try {
                ret = cb(value)
            }
            catch (e) {
                deferred.reject(e)
                return
            }
            deferred.resolve(ret)
        })
    }

    function resolve(newValue) {
        if (delegating)
            return
        resolve_(newValue)
    }

    function resolve_(newValue) {
        if (state !== null)
            return
        try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
            if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.')
            if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
                var then = newValue.then
                if (typeof then === 'function') {
                    delegating = true
                    then.call(newValue, resolve_, reject_)
                    return
                }
            }
            state = true
            value = newValue
            finale()
        } catch (e) { reject_(e) }
    }

    function reject(newValue) {
        if (delegating)
            return
        reject_(newValue)
    }

    function reject_(newValue) {
        if (state !== null)
            return
        state = false
        value = newValue
        finale()
    }

    function finale() {
        for (var i = 0, len = deferreds.length; i < len; i++)
            handle(deferreds[i])
        deferreds = null
    }

    try { fn(resolve, reject) }
    catch(e) { reject(e) }
}


// then/promise specific extensions to the core promise API
window.Promise.from = function (value) {
    // if (value instanceof Promise) return value
    if(value && typeof value.then == 'function') return value;
    return new Promise(function (resolve) { resolve(value) })
}

window.Promise.all = function () {
    var args = Array.prototype.slice.call(arguments.length === 1 && Array.isArray(arguments[0]) ? arguments[0] : arguments)

    return new Promise(function (resolve, reject) {
        if (args.length === 0) return resolve([])
        var remaining = args.length
        function res(i, val) {
            try {
                if (val && (typeof val === 'object' || typeof val === 'function')) {
                    var then = val.then
                    if (typeof then === 'function') {
                        then.call(val, function (val) { res(i, val) }, reject)
                        return
                    }
                }
                args[i] = val
                if (--remaining === 0) {
                    resolve(args);
                }
            } catch (ex) {
                reject(ex)
            }
        }
        for (var i = 0; i < args.length; i++) {
            res(i, args[i])
        }
    })
}

/* Prototype Methods */

window.Promise.prototype.done = function (onFulfilled, onRejected) {
    var self = arguments.length ? this.then.apply(this, arguments) : this
    self.then(null, function (err) {
        nextTick(function () {
            throw err
        })
    })
}


})();