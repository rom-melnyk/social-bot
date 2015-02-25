if (!global.$vkQueue) {
    global.$vkQueue = {
        queue: [],
        _running: false,
        _interval: null,
        add: function (cb) {
            var me = this,
                F;
            if (typeof cb === "function") {
                me.queue.push(cb);
                F = function () {
                    if (!!me.queue.length) {
                        setTimeout(function () {
                            me.queue.shift()(F);
                        }, 350);
                    } else {
                        me._running = false;
                    }
                }
                if (!me._running) {
                    me._running = true;
                    F();
                }
            }
        }
    };
}
module.exports = global.$vkQueue;
