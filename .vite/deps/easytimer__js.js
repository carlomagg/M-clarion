import {
  __commonJS
} from "./chunk-QHEXK6IG.js";

// node_modules/easytimer.js/dist/easytimer.js
var require_easytimer = __commonJS({
  "node_modules/easytimer.js/dist/easytimer.js"(exports, module) {
    (function(global, factory) {
      typeof exports === "object" && typeof module !== "undefined" ? factory(exports) : typeof define === "function" && define.amd ? define(["exports"], factory) : (global = typeof globalThis !== "undefined" ? globalThis : global || self, factory(global.easytimer = {}));
    })(exports, function(exports2) {
      "use strict";
      function ownKeys(e, r) {
        var t = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var o = Object.getOwnPropertySymbols(e);
          r && (o = o.filter(function(r2) {
            return Object.getOwnPropertyDescriptor(e, r2).enumerable;
          })), t.push.apply(t, o);
        }
        return t;
      }
      function _objectSpread2(e) {
        for (var r = 1; r < arguments.length; r++) {
          var t = null != arguments[r] ? arguments[r] : {};
          r % 2 ? ownKeys(Object(t), true).forEach(function(r2) {
            _defineProperty(e, r2, t[r2]);
          }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function(r2) {
            Object.defineProperty(e, r2, Object.getOwnPropertyDescriptor(t, r2));
          });
        }
        return e;
      }
      function _typeof(o) {
        "@babel/helpers - typeof";
        return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
          return typeof o2;
        } : function(o2) {
          return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
        }, _typeof(o);
      }
      function _defineProperty(obj, key, value) {
        key = _toPropertyKey(key);
        if (key in obj) {
          Object.defineProperty(obj, key, {
            value,
            enumerable: true,
            configurable: true,
            writable: true
          });
        } else {
          obj[key] = value;
        }
        return obj;
      }
      function _toPrimitive(input, hint) {
        if (typeof input !== "object" || input === null)
          return input;
        var prim = input[Symbol.toPrimitive];
        if (prim !== void 0) {
          var res = prim.call(input, hint || "default");
          if (typeof res !== "object")
            return res;
          throw new TypeError("@@toPrimitive must return a primitive value.");
        }
        return (hint === "string" ? String : Number)(input);
      }
      function _toPropertyKey(arg) {
        var key = _toPrimitive(arg, "string");
        return typeof key === "symbol" ? key : String(key);
      }
      function leftPadding(string, padLength, character) {
        var i;
        var characters = "";
        string = typeof string === "number" ? String(string) : string;
        if (string.length > padLength) {
          return string;
        }
        for (i = 0; i < padLength; i = i + 1) {
          characters += String(character);
        }
        return (characters + string).slice(-characters.length);
      }
      function TimeCounter() {
        this.reset();
      }
      TimeCounter.prototype.toString = function() {
        var units = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ["hours", "minutes", "seconds"];
        var separator = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : ":";
        var leftZeroPadding = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 2;
        units = units || ["hours", "minutes", "seconds"];
        separator = separator || ":";
        leftZeroPadding = leftZeroPadding || 2;
        var arrayTime = [];
        var i;
        for (i = 0; i < units.length; i = i + 1) {
          if (this[units[i]] !== void 0) {
            if (units[i] === "secondTenths") {
              arrayTime.push(this[units[i]]);
            } else {
              arrayTime.push(leftPadding(this[units[i]], leftZeroPadding, "0"));
            }
          }
        }
        return arrayTime.join(separator);
      };
      TimeCounter.prototype.reset = function() {
        this.secondTenths = 0;
        this.seconds = 0;
        this.minutes = 0;
        this.hours = 0;
        this.days = 0;
      };
      function EventEmitter() {
        this.events = {};
      }
      EventEmitter.prototype.on = function(event, listener) {
        var _this = this;
        if (!Array.isArray(this.events[event])) {
          this.events[event] = [];
        }
        this.events[event].push(listener);
        return function() {
          return _this.removeListener(event, listener);
        };
      };
      EventEmitter.prototype.removeListener = function(event, listener) {
        if (Array.isArray(this.events[event])) {
          var eventIndex = this.events[event].indexOf(listener);
          if (eventIndex > -1) {
            this.events[event].splice(eventIndex, 1);
          }
        }
      };
      EventEmitter.prototype.removeAllListeners = function(event) {
        if (!event) {
          this.events = {};
        } else if (Array.isArray(this.events[event])) {
          this.events[event] = [];
        }
      };
      EventEmitter.prototype.emit = function(event) {
        var _this2 = this;
        for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }
        if (Array.isArray(this.events[event])) {
          this.events[event].forEach(function(listener) {
            return listener.apply(_this2, args);
          });
        }
      };
      var SECOND_TENTHS_PER_SECOND = 10;
      var SECONDS_PER_MINUTE = 60;
      var MINUTES_PER_HOUR = 60;
      var HOURS_PER_DAY = 24;
      var SECOND_TENTHS_POSITION = 0;
      var SECONDS_POSITION = 1;
      var MINUTES_POSITION = 2;
      var HOURS_POSITION = 3;
      var DAYS_POSITION = 4;
      var SECOND_TENTHS = "secondTenths";
      var SECONDS = "seconds";
      var MINUTES = "minutes";
      var HOURS = "hours";
      var DAYS = "days";
      var VALID_INPUT_VALUES = [SECOND_TENTHS, SECONDS, MINUTES, HOURS, DAYS];
      var unitsInMilliseconds = {
        secondTenths: 100,
        seconds: 1e3,
        minutes: 6e4,
        hours: 36e5,
        days: 864e5
      };
      var groupedUnits = {
        secondTenths: SECOND_TENTHS_PER_SECOND,
        seconds: SECONDS_PER_MINUTE,
        minutes: MINUTES_PER_HOUR,
        hours: HOURS_PER_DAY
      };
      function mod(number, module2) {
        return (number % module2 + module2) % module2;
      }
      function Timer() {
        var defaultParams = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        var counters = new TimeCounter();
        var totalCounters = new TimeCounter();
        var intervalId;
        var eventEmitter = new EventEmitter();
        var running = false;
        var paused = false;
        var precision;
        var timerTypeFactor;
        var customCallback;
        var timerConfig = {};
        var currentParams;
        var targetValues;
        var startValues;
        var countdown;
        var startingDate;
        var targetDate;
        var eventData = {
          detail: {
            timer: this
          }
        };
        setParams(defaultParams);
        function updateCounters(precision2, roundedValue) {
          var unitsPerGroup = groupedUnits[precision2];
          totalCounters[precision2] = roundedValue;
          if (precision2 === DAYS) {
            counters[precision2] = Math.abs(roundedValue);
          } else if (roundedValue >= 0) {
            counters[precision2] = mod(roundedValue, unitsPerGroup);
          } else {
            counters[precision2] = mod(unitsPerGroup - mod(roundedValue, unitsPerGroup), unitsPerGroup);
          }
        }
        function updateDays(value) {
          return updateUnitByPrecision(value, DAYS);
        }
        function updateHours(value) {
          return updateUnitByPrecision(value, HOURS);
        }
        function updateMinutes(value) {
          return updateUnitByPrecision(value, MINUTES);
        }
        function updateSeconds(value) {
          return updateUnitByPrecision(value, SECONDS);
        }
        function updateSecondTenths(value) {
          return updateUnitByPrecision(value, SECOND_TENTHS);
        }
        function updateUnitByPrecision(value, precision2) {
          var previousValue = totalCounters[precision2];
          updateCounters(precision2, calculateIntegerUnitQuotient(value, unitsInMilliseconds[precision2]));
          return totalCounters[precision2] !== previousValue;
        }
        function stopTimerAndResetCounters() {
          stopTimer();
          resetCounters();
        }
        function stopTimer() {
          clearInterval(intervalId);
          intervalId = void 0;
          running = false;
          paused = false;
        }
        function setParamsAndStartTimer(params) {
          if (!isPaused()) {
            setParams(params);
          } else {
            startingDate = calculateStartingDate();
            targetValues = setTarget(currentParams.target);
          }
          startTimer();
        }
        function startTimer() {
          var interval = unitsInMilliseconds[precision];
          if (isTargetAchieved(roundTimestamp(Date.now()))) {
            return;
          }
          intervalId = setInterval(updateTimerAndDispatchEvents, interval);
          running = true;
          paused = false;
        }
        function calculateStartingDate() {
          return roundTimestamp(Date.now()) - totalCounters.secondTenths * unitsInMilliseconds[SECOND_TENTHS] * timerTypeFactor;
        }
        function updateTimerAndDispatchEvents() {
          var currentTime = roundTimestamp(Date.now());
          var valuesUpdated = updateTimer();
          dispatchEvents(valuesUpdated);
          customCallback(eventData.detail.timer);
          if (isTargetAchieved(currentTime)) {
            stop();
            dispatchEvent("targetAchieved", eventData);
          }
        }
        function updateTimer() {
          var currentTime = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : roundTimestamp(Date.now());
          var elapsedTime = timerTypeFactor > 0 ? currentTime - startingDate : startingDate - currentTime;
          var valuesUpdated = {};
          valuesUpdated[SECOND_TENTHS] = updateSecondTenths(elapsedTime);
          valuesUpdated[SECONDS] = updateSeconds(elapsedTime);
          valuesUpdated[MINUTES] = updateMinutes(elapsedTime);
          valuesUpdated[HOURS] = updateHours(elapsedTime);
          valuesUpdated[DAYS] = updateDays(elapsedTime);
          return valuesUpdated;
        }
        function roundTimestamp(timestamp) {
          return Math.floor(timestamp / unitsInMilliseconds[precision]) * unitsInMilliseconds[precision];
        }
        function dispatchEvents(valuesUpdated) {
          if (valuesUpdated[SECOND_TENTHS]) {
            dispatchEvent("secondTenthsUpdated", eventData);
          }
          if (valuesUpdated[SECONDS]) {
            dispatchEvent("secondsUpdated", eventData);
          }
          if (valuesUpdated[MINUTES]) {
            dispatchEvent("minutesUpdated", eventData);
          }
          if (valuesUpdated[HOURS]) {
            dispatchEvent("hoursUpdated", eventData);
          }
          if (valuesUpdated[DAYS]) {
            dispatchEvent("daysUpdated", eventData);
          }
        }
        function isTargetAchieved(currentDate) {
          return targetValues instanceof Array && currentDate >= targetDate;
        }
        function resetCounters() {
          counters.reset();
          totalCounters.reset();
        }
        function setParams(params) {
          params = params || {};
          precision = checkPrecision(params.precision);
          customCallback = typeof params.callback === "function" ? params.callback : function() {
          };
          countdown = params.countdown === true;
          timerTypeFactor = countdown === true ? -1 : 1;
          if (_typeof(params.startValues) === "object") {
            setStartValues(params.startValues);
          } else {
            startValues = null;
          }
          startingDate = calculateStartingDate();
          updateTimer();
          if (_typeof(params.target) === "object") {
            targetValues = setTarget(params.target);
          } else if (countdown) {
            params.target = {
              seconds: 0
            };
            targetValues = setTarget(params.target);
          } else {
            targetValues = null;
          }
          timerConfig = {
            precision,
            callback: customCallback,
            countdown: _typeof(params) === "object" && params.countdown === true,
            target: targetValues,
            startValues
          };
          currentParams = params;
        }
        function checkPrecision(precision2) {
          precision2 = typeof precision2 === "string" ? precision2 : SECONDS;
          if (!isValidInputValue(precision2)) {
            throw new Error("Error in precision parameter: ".concat(precision2, " is not a valid value"));
          }
          return precision2;
        }
        function isValidInputValue(value) {
          return VALID_INPUT_VALUES.indexOf(value) >= 0;
        }
        function configInputValues(inputValues) {
          var values;
          if (_typeof(inputValues) === "object") {
            if (inputValues instanceof Array) {
              if (inputValues.length !== 5) {
                throw new Error("Array size not valid");
              }
              values = inputValues;
            } else {
              for (var value in inputValues) {
                if (VALID_INPUT_VALUES.indexOf(value) < 0) {
                  throw new Error("Error in startValues or target parameter: ".concat(value, " is not a valid input value"));
                }
              }
              values = [inputValues.secondTenths || 0, inputValues.seconds || 0, inputValues.minutes || 0, inputValues.hours || 0, inputValues.days || 0];
            }
          }
          values = values.map(function(value2) {
            return parseInt(value2, 10);
          });
          var secondTenths = values[SECOND_TENTHS_POSITION];
          var seconds = values[SECONDS_POSITION] + calculateIntegerUnitQuotient(secondTenths, SECOND_TENTHS_PER_SECOND);
          var minutes = values[MINUTES_POSITION] + calculateIntegerUnitQuotient(seconds, SECONDS_PER_MINUTE);
          var hours = values[HOURS_POSITION] + calculateIntegerUnitQuotient(minutes, MINUTES_PER_HOUR);
          var days = values[DAYS_POSITION] + calculateIntegerUnitQuotient(hours, HOURS_PER_DAY);
          values[SECOND_TENTHS_POSITION] = secondTenths % SECOND_TENTHS_PER_SECOND;
          values[SECONDS_POSITION] = seconds % SECONDS_PER_MINUTE;
          values[MINUTES_POSITION] = minutes % MINUTES_PER_HOUR;
          values[HOURS_POSITION] = hours % HOURS_PER_DAY;
          values[DAYS_POSITION] = days;
          return values;
        }
        function calculateIntegerUnitQuotient(unit, divisor) {
          var quotient = unit / divisor;
          return quotient < 0 ? Math.ceil(quotient) : Math.floor(quotient);
        }
        function setTarget(inputTarget) {
          if (!inputTarget) {
            return;
          }
          targetValues = configInputValues(inputTarget);
          var targetCounter = calculateTotalCounterFromValues(targetValues);
          targetDate = startingDate + targetCounter.secondTenths * unitsInMilliseconds[SECOND_TENTHS] * timerTypeFactor;
          return targetValues;
        }
        function setStartValues(inputStartValues) {
          startValues = configInputValues(inputStartValues);
          counters.secondTenths = startValues[SECOND_TENTHS_POSITION];
          counters.seconds = startValues[SECONDS_POSITION];
          counters.minutes = startValues[MINUTES_POSITION];
          counters.hours = startValues[HOURS_POSITION];
          counters.days = startValues[DAYS_POSITION];
          totalCounters = calculateTotalCounterFromValues(startValues, totalCounters);
        }
        function calculateTotalCounterFromValues(values, outputCounter) {
          var total = outputCounter || {};
          total.days = values[DAYS_POSITION];
          total.hours = total.days * HOURS_PER_DAY + values[HOURS_POSITION];
          total.minutes = total.hours * MINUTES_PER_HOUR + values[MINUTES_POSITION];
          total.seconds = total.minutes * SECONDS_PER_MINUTE + values[SECONDS_POSITION];
          total.secondTenths = total.seconds * SECOND_TENTHS_PER_SECOND + values[[SECOND_TENTHS_POSITION]];
          return total;
        }
        function stop() {
          stopTimerAndResetCounters();
          dispatchEvent("stopped", eventData);
        }
        function reset() {
          stopTimerAndResetCounters();
          setParamsAndStartTimer(currentParams);
          dispatchEvent("reset", eventData);
        }
        function start() {
          var params = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
          params = _objectSpread2(_objectSpread2({}, defaultParams), params);
          if (isRunning()) {
            return;
          }
          setParamsAndStartTimer(params);
          dispatchEvent("started", eventData);
        }
        function pause() {
          stopTimer();
          paused = true;
          dispatchEvent("paused", eventData);
        }
        function addEventListener(eventType, listener) {
          eventEmitter.on(eventType, listener);
        }
        function removeEventListener(eventType, listener) {
          eventEmitter.removeListener(eventType, listener);
        }
        function removeAllEventListeners(eventType) {
          eventEmitter.removeAllListeners(eventType);
        }
        function dispatchEvent(eventType, data) {
          eventEmitter.emit(eventType, data);
        }
        function isRunning() {
          return running;
        }
        function isPaused() {
          return paused;
        }
        function getTimeValues() {
          return counters;
        }
        function getTotalTimeValues() {
          return totalCounters;
        }
        function getConfig() {
          return timerConfig;
        }
        if (typeof this !== "undefined") {
          this.start = start;
          this.pause = pause;
          this.stop = stop;
          this.reset = reset;
          this.isRunning = isRunning;
          this.isPaused = isPaused;
          this.getTimeValues = getTimeValues;
          this.getTotalTimeValues = getTotalTimeValues;
          this.getConfig = getConfig;
          this.addEventListener = addEventListener;
          this.on = addEventListener;
          this.removeEventListener = removeEventListener;
          this.removeAllEventListeners = removeAllEventListeners;
          this.off = removeEventListener;
        }
      }
      exports2.Timer = Timer;
      exports2.default = Timer;
      Object.defineProperty(exports2, "__esModule", { value: true });
    });
  }
});
export default require_easytimer();
//# sourceMappingURL=easytimer__js.js.map
