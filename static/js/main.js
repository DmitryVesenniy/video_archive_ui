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

var AppState = /** @class */ (function () {
    function AppState() {
        this.serviceUrl = "http://87.226.199.63:8081/";
        this.load = false;
        this._camera = "";
        this.deltaTime = 300;
        this.errorMessage = '';
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
        $("#msg").html("");
        if (!!this.dateFormStart) {
            this.dateFormStart.clearError();
        }
        if (!!this.dateFormEnd) {
            this.dateFormEnd.clearError();
        }
    };
    AppState.prototype.formErrorMessage = function () {
        $("#msg").html(this.errorMessage);
    };
    AppState.prototype.validateForm = function () {
        this.dateFormStart = new DateForm($('input[name="calendar_start"]'), $('input#start'));
        this.dateFormEnd = new DateForm($('input[name="calendar_end"]'), $('input#end'));
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


var DateForm = /** @class */ (function () {
    function DateForm(inputDay, inputTime) {
        this.inputDay = inputDay;
        this.inputTime = inputTime;
        this.date = new Date(this.inputDay.val() + "T" + this.inputTime.val());
    }
    DateForm.prototype.clearError = function () {
        this.inputDay.removeClass("error__border");
        this.inputTime.removeClass("error__border");
    };
    DateForm.prototype.isValid = function () {
        var result = true;
        if (!this.inputDay.val()) {
            this.inputDay.addClass("error__border");
            result = false;
        }
        if (!this.inputTime.val()) {
            this.inputTime.addClass("error__border");
            result = false;
        }
        return result && !!this.date.valueOf();
        ;
    };
    DateForm.prototype.getUnixTime = function () {
        var valueTime = this.date.valueOf();
        if (valueTime) {
            return Math.round(valueTime/1000);
        }
        return 0;
    };
    DateForm.prototype.deltaTime = function (dateForm) {
        return this.getUnixTime() - dateForm.getUnixTime();
    };
    return DateForm;
}());