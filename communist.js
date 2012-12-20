  var Communist, communist,
    __slice = [].slice;

  Communist = function(fun) {
    var bUrl, blob, body, func, _func, _worker;
    if (typeof fun !== "function") {
      return;
    }
    if (window.Worker) {
      window.URL = window.URL || window.webkiURL;
      func = fun.toString();
      body = "var f = " + func + ";self.addEventListener('message', function(e) {self.postMessage(f.apply(null, e.data))})";
      blob = new Blob([body], {
        type: "text/javascript"
      });
      bUrl = window.URL.createObjectURL(blob);
      _worker = new Worker(bUrl);
      this.send = function() {
        var cb, data, _i;
        data = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
        _worker.postMessage(data);
        _worker.onmessage = function(e) {
          cb(e.data);
          return true;
        };
        return true;
      };
      this.close = function() {
        _worker.terminate();
        return true;
      };
      return true;
    } else {
      _func = fun;
      this.send = function() {
        var cb, data, _i;
        data = 2 <= arguments.length ? __slice.call(arguments, 0, _i = arguments.length - 1) : (_i = 0, []), cb = arguments[_i++];
        cb(_func.apply(null, data));
        return true;
      };
      this.close = function() {
        return true;
      };
      return true;
    }
  };

  communist = function(fun) {
    return new Communist(fun);
  };
