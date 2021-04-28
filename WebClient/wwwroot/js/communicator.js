var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import * as signalR from "@microsoft/signalr";
var Communicator = /** @class */ (function () {
    function Communicator() {
        var _this = this;
        //singlr connection cannot be started in a constructor; use a wrapper to setup connection
        this.connectionWrapper = new /** @class */ (function () {
            function class_1() {
            }
            class_1.prototype.establishConnection = function () {
                this.connection = new signalR.HubConnectionBuilder().withUrl("https://localhost:5001/testhub").build();
                this.connection.start();
            };
            //map the handler to the hub method
            class_1.prototype.registerCallback = function (hubMethod, handler) {
                this.connection.on(hubMethod, handler);
            };
            //deregister all callbacks from the hub method
            class_1.prototype.deregisterAllCallbacks = function (hubMethod) {
                this.connection.off(hubMethod);
            };
            return class_1;
        }());
        this.connectionWrapper.establishConnection();
        this.callbacksByTopics = new Map();
        this.connectionWrapper.registerCallback("ReceiveMessage", function (user, message) {
            console.log("inside receiveHandler");
            //TODO: deal with message with multiple topics; service need to send topic to the communicator
            var testTopic = "A"; //TODO: delete later; need to get this from the service
            console.log(_this.callbacksByTopics);
            var topicCallback = _this.callbacksByTopics.get(testTopic);
            console.log("get callback:");
            console.log(topicCallback);
            topicCallback(user, message); //TODO: add parameters list?
        });
    }
    //publish message under certain topic
    Communicator.prototype.publish = function (user, topic, message) {
        console.log("Client called publish method");
        this.connectionWrapper.connection.invoke("PublishMessageAsync", user, topic, message);
    };
    //subscribe to a topic, store the callback function for that topic, and invoke responseCallback for state of subscription
    Communicator.prototype.subscribeAsync = function (topic, topicCallback, responseCallback) {
        return __awaiter(this, void 0, void 0, function () {
            var result, statusCode;
            var _this = this;
            return __generator(this, function (_a) {
                console.log("Client called subscribe method");
                result = this.connectionWrapper.connection.invoke("SubscribeTopicAsync", topic);
                console.log(result); //test
                result.then(function () {
                    statusCode = 0;
                    responseCallback(statusCode);
                    //TODO: can client change the callback for the same topic? if so, then:
                    //TODO: deregister the cached callback if topic has been subscribed, and cache new callback
                    //add callback function to the dictionary
                    _this.callbacksByTopics.set(topic, topicCallback);
                    console.log(_this.callbacksByTopics); //test
                }).catch(function (err) {
                    statusCode = 1;
                    responseCallback(statusCode);
                });
                return [2 /*return*/];
            });
        });
    };
    Communicator.prototype.unsubscribeAsync = function (topic) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Client called unsubscribe method");
                        return [4 /*yield*/, this.connectionWrapper.connection.invoke("UnsubscribeTopicAsync", topic)];
                    case 1:
                        _a.sent();
                        //TODO: add promise logic here
                        if (this.callbacksByTopics.has(topic)) {
                            this.callbacksByTopics.delete(topic);
                            console.log(this.callbacksByTopics); //test
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return Communicator;
}());
export { Communicator };
//# sourceMappingURL=communicator.js.map