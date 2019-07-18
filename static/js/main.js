Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

Date.prototype.toTimeInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(11, 19);
});
// http://87.226.199.63:8081/cam312/2019/07/17/11/09/29-preview.mp4


var AppState = /** @class */ (function () {
    function AppState() {
        this.serviceUrl = "http://87.226.199.63:8081/";
        this.load = false;
        this._camera = "";
        this.deltaTime = 300;
        this.errorMessage = '';
        //modal message
        this.modalWin = new ModalWindow();
    }
    AppState.prototype.getUrlParametrs = function () {
        var params = window.location.search.substr(1);
        var keys = {};
        params.split('&').forEach(function (item) {
            var _a = item.split('='), key = _a[0], value = _a[1];
            if (key && value) {
                keys[key] = value;
            }
        });
        return keys;
    };
    AppState.prototype.setDate = function (date) {
        $('input[type="date"]').val(date.toDateInputValue());
    };
    AppState.prototype.setTime = function (date) {
        $('input#end').val(date.toTimeInputValue());
        $('input#start').val(new Date(date - this.deltaTime * 1000).toTimeInputValue());
    };
    AppState.prototype.loadDocument = function () {
        this.dateFormStart = new DateForm($('input[name="calendar_start"]'), $('input#start'));
        this.dateFormEnd = new DateForm($('input[name="calendar_end"]'), $('input#end'));
        var date = new Date();
        var loader = $("#loader");
        this.setDate(date);
        this.setTime(date);
        this.load = true;
        var camera = this.setCamera();
        if (camera === undefined) {
            return;
        }
        this._camera = camera;
        this.setEndpointCamera();
        this.setEndpointScreen();
        loader.hide();
    };
    Object.defineProperty(AppState.prototype, "camera", {
        get: function () {
            return this._camera;
        },
        set: function (value) {
            this._camera = value;
        },
        enumerable: true,
        configurable: true
    });
    AppState.prototype.setEndpointCamera = function () {
        $(".video__connect").attr("src", this.serviceUrl + this._camera + "/embed.html?dvr=true");
    };
    AppState.prototype.setEndpointScreen = function (arg) {
        if (arg === void 0) { arg = ""; }
        if (arg) {
            switch (arg) {
                case "start": {
                    if (this.dateFormStart.isValid()) {
                        $("#videoscreen__start").attr("src", this.createUrlSreen(this.dateFormStart));
                    }
                    break;
                }
                case "end": {
                    if (this.dateFormEnd.isValid()) {
                        $("#videoscreen__end").attr("src", this.createUrlSreen(this.dateFormEnd));
                    }
                }
            }
            return;
        }
        if (this.dateFormStart.isValid()) {
            $("#videoscreen__start").attr("src", this.createUrlSreen(this.dateFormStart));
        }
        if (this.dateFormEnd.isValid()) {
            $("#videoscreen__end").attr("src", this.createUrlSreen(this.dateFormEnd));
        }
    };
    AppState.prototype.createUrlSreen = function (data) {
        return this.serviceUrl + this._camera + "/" + data.getUrlTime() + "-preview.mp4";
    };
    AppState.prototype.notPage = function () {
        var infoElement = $(".not_page__info");
        var loaderElement = $(".loader");
        loaderElement.hide();
        var message = "<div class='error'><h1>" + this.errorMessage + "</h1></div>";
        infoElement.html(message);
    };
    AppState.prototype.setCamera = function () {
        var getParametrs = this.getUrlParametrs();
        if (!getParametrs || getParametrs.camera === undefined) {
            this.errorMessage = "Ни одна камера не была выбрана.";
            this.notPage();
        }
        return getParametrs.camera;
    };
    AppState.prototype.calcUnixTime = function () {
        return [this.dateFormStart.getUnixTime(), this.dateFormEnd.deltaTime(this.dateFormStart)];
    };
    AppState.prototype.createUrlService = function () {
        this.clearMessage();
        if (!this.validateForm()) {
            this.formErrorMessage();
            return;
        }
        var _a = this.calcUnixTime(), time = _a[0], delta = _a[1];
        var url = this.serviceUrl + this._camera + "/archive-" + time + "-" + delta + ".mp4";
        return url;
    };
    AppState.prototype.clearMessage = function () {
        this.modalWin.hide();
        this.errorMessage = "";
        if (!!this.dateFormStart) {
            this.dateFormStart.clearError();
        }
        if (!!this.dateFormEnd) {
            this.dateFormEnd.clearError();
        }
    };
    AppState.prototype.formErrorMessage = function () {
        this.modalWin.show(this.errorMessage);
    };
    AppState.prototype.validateForm = function () {
        this.errorMessage = "";
        if (!this.dateFormStart.isValid() || !this.dateFormEnd.isValid()) {
            this.errorMessage = "Нужно заполнить все поля с датами.";
            return false;
        }
        if (this.dateFormStart.getUnixTime() >= this.dateFormEnd.getUnixTime()) {
            this.errorMessage = "Стартовая дата не может быть больше конечной";
            return false;
        }
        return true;
    };
    return AppState;
}());


var ModalWindow = /** @class */ (function () {
    function ModalWindow() {
        var _this = this;
        this.isShow = false;
        this.jqObj = $("#modal__error");
        this.jqObj.children("#close").on("click", function (event) {
            _this.hide();
        });
    }
    ModalWindow.prototype.show = function (msg) {
        var _this = this;
        this.jqObj.show();
        this.jqObj.children("#msg").html(msg);
        this.isShow = true;
        this.timeObj = setTimeout(function () {
            _this.hide();
        }, 3000);
    };
    ModalWindow.prototype.hide = function () {
        if (this.timeObj) {
            clearTimeout(this.timeObj);
        }
        this.isShow = false;
        this.jqObj.hide();
    };
    return ModalWindow;
}());


var DateForm = /** @class */ (function () {
    function DateForm(inputDay, inputTime) {
        this.inputDay = inputDay;
        this.inputTime = inputTime;
    }
    DateForm.prototype.init = function () {
        this.date = new Date(this.inputDay.val() + "T" + this.inputTime.val());
    };
    DateForm.prototype.clearError = function () {
        this.inputDay.removeClass("error__border");
        this.inputTime.removeClass("error__border");
    };
    DateForm.prototype.isValid = function () {
        this.init();
        if (!this.inputDay.val()) {
            this.inputDay.addClass("error__border");
        }
        if (!this.inputTime.val()) {
            this.inputTime.addClass("error__border");
        }
        return !!this.date.valueOf();
        ;
    };
    DateForm.prototype.getUrlTime = function () {
        if (!this.date.valueOf()) {
            return "";
        }
        var d = [
            "" + this.date.getFullYear(),
            this.date.getUTCMonth() < 9 ? "0" + (this.date.getUTCMonth() + 1) : "" + (this.date.getUTCMonth() + 1),
            this.date.getUTCDate() < 10 ? "0" + this.date.getUTCDate() : "" + this.date.getUTCDate(),
            this.date.getUTCHours() < 10 ? "0" + this.date.getUTCHours() : "" + this.date.getUTCHours(),
            this.date.getUTCMinutes() < 10 ? "0" + this.date.getUTCMinutes() : "" + this.date.getUTCMinutes(),
            this.date.getUTCSeconds() < 10 ? "0" + this.date.getUTCSeconds() : "" + this.date.getUTCSeconds()
        ];
        return d.join("/");
    };
    DateForm.prototype.getUnixTime = function () {
        var valueTime = this.date.valueOf();
        if (valueTime) {
            return valueTime / 1000;
        }
        return 0;
    };
    DateForm.prototype.deltaTime = function (dateForm) {
        return this.getUnixTime() - dateForm.getUnixTime();
    };
    return DateForm;
}());