class AppState {
    private serviceUrl = "http://87.226.199.63:8081/"
    private load: boolean = false;
    private _camera: string = "";

    private deltaTime: number = 300;

    private errorMessage: string = '';

    // date forms
    private dateFormStart: DateForm;
    private dateFormEnd: DateForm;

    getUrlParametrs(): any {
        const params = window.location.search.substr(1);
        const keys: any = {};

        params.split('&').forEach( item => {
            let [key, value] = item.split('=');
            if ( key && value ) {
                keys[key] = value;
            }
        } );
        return keys;
    }

    setDate(date: Date): void {
        $('input[type="date"]').val(date.toDateInputValue());
    }

    setTime(date: Date): void {
        $('input#end').val(date.toTimeInputValue());
        $('input#start').val(new Date(date - this.deltaTime * 1000).toTimeInputValue());
    }

    loadDocument(): void {
        const date = new Date();
        const loader = $("#loader");
        this.setDate(date);
        this.setTime(date);
        this.load = true;
        const camera = this.setCamera();
        if ( camera === undefined ) {
            return;
        }
        this._camera = camera;
        this.setEndpointCamera();
        loader.hide();
    }

    get camera(): string {
        return this._camera;
    }

    set camera(value: string) {
        this._camera = value;
    }

    setEndpointCamera(): void {
        $(".video__connect").attr("src", this.serviceUrl + this._camera + "/embed.html?dvr=true");
    }

    notPage(): void {
        const infoElement = $(".not_page__info");
        const loaderElement = $(".loader");
        loaderElement.hide();

        let message = "<div class='error'><h1>" + this.errorMessage + "</h1></div>"
        infoElement.html(message);
    }

    setCamera(): string|void {
        const getParametrs = this.getUrlParametrs();
        if ( !getParametrs || getParametrs.camera === undefined ) {
            this.errorMessage = "Ни одна камера не была выбрана."
            this.notPage();
        }
        return getParametrs.camera;
    }

    calcUnixTime(): number[] {
        return [this.dateFormStart.getUnixTime(), this.dateFormEnd.deltaTime(this.dateFormStart)];
    }

    createUrlService(): string|void {
        this.clearMessage();
        if ( !this.validateForm() ) {
            this.formErrorMessage();
            return;
        }
        let [time, delta] = this.calcUnixTime();
        const url = this.serviceUrl + this._camera + "/archive-" + time + "-" + delta + ".mp4";
        return url;
    }

    clearMessage(): void {
        $("#msg").html("");

        if ( !!this.dateFormStart ) {
            this.dateFormStart.clearError();
        }
        if ( !!this.dateFormEnd ) {
            this.dateFormEnd.clearError();
        }
    }

    formErrorMessage(): void {
        $("#msg").html(this.errorMessage);
    }

    validateForm(): boolean {
        this.dateFormStart = new DateForm($('input[name="calendar_start"]'), $('input#start'));
        this.dateFormEnd = new DateForm($('input[name="calendar_end"]'), $('input#end');

        this.errorMessage = "";
        if ( !this.dateFormStart.isValid() || !this.dateFormEnd.isValid() ) {
            this.errorMessage = "Нужно заполнить все поля с датами.";
            return false
        }
        if ( this.dateFormStart.getUnixTime() >=  this.dateFormEnd.getUnixTime() ) {
            this.errorMessage = "Стартовая дата не может быть больше конечной";
            return false
        }
        return true;
    }
}


class DateForm {
    inputDay: any;
    inputTime: any;

    date: Date;

    constructor(inputDay: any, inputTime: any) {
        this.inputDay = inputDay;
        this.inputTime = inputTime;
        this.date = new Date(this.inputDay.val() + "T" + this.inputTime.val());
    }

    clearError(): void {
        this.inputDay.removeClass("error__border");
        this.inputTime.removeClass("error__border");
    }

    isValid(): boolean {
        if ( !this.inputDay.val() ) {
            this.inputDay.addClass("error__border");
        }
        if ( !this.inputTime.val() ) {
            this.inputTime.addClass("error__border");
        }
        
        return !!this.date.valueOf();;        
    }

    getUnixTime(): number {
        const valueTime = this.date.valueOf();
        if ( valueTime ) {
            return Math.round(valueTime/1000);
        } 
        return 0;
    }

    deltaTime(dateForm: DateForm): number {
        return (this.getUnixTime() - dateForm.getUnixTime()) / 1000;
    }
}