class AppState {
    private serviceUrl = "http://87.226.199.63:8081/"
    private load: boolean = false;
    private _camera: string = "";

    private deltaTime: number = 300;

    private errorMessage: string = '';

    // date forms
    private dateFormStart: DateForm;
    private dateFormEnd: DateForm;

    //modal message
    private modalWin: ModalWindow = new ModalWindow();


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
        this.dateFormStart = new DateForm($('input[name="calendar_start"]'), $('input#start'));
        this.dateFormEnd = new DateForm($('input[name="calendar_end"]'), $('input#end');

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
        this.setEndpointScreen();
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

    setEndpointScreen(arg: string = ""): void {
        if ( arg ) {
            switch ( arg ) {
                case "start": {
                    if ( this.dateFormStart.isValid() ) {
                        $("#videoscreen__start").attr("src", this.createUrlSreen(this.dateFormStart));
                    }
                    break;
                }
                case "end": {
                    if ( this.dateFormEnd.isValid() ) {
                        $("#videoscreen__end").attr("src", this.createUrlSreen(this.dateFormEnd));
                    }
                }
            }
            return;
        }
        if ( this.dateFormStart.isValid() ) {
            $("#videoscreen__start").attr("src", this.createUrlSreen(this.dateFormStart));
        }

        if ( this.dateFormEnd.isValid() ) {
            $("#videoscreen__end").attr("src", this.createUrlSreen(this.dateFormEnd));
        }
    }

    createUrlSreen(data: DateForm): string {
        return this.serviceUrl + this._camera + "/" + data.getUrlTime() + "-preview.mp4";
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
        this.modalWin.hide();
        this.errorMessage = "";

        if ( !!this.dateFormStart ) {
            this.dateFormStart.clearError();
        }
        if ( !!this.dateFormEnd ) {
            this.dateFormEnd.clearError();
        }
    }

    formErrorMessage(): void {
        this.modalWin.show(this.errorMessage);

    }

    validateForm(): boolean {
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

class ModalWindow {
    private isShow: boolean = false;
    private jqObj: any;
    private timeObj: any;

    constructor() {
        this.jqObj = $("#modal__error");
        this.jqObj.children("#close").on("click", (event) => {
            this.hide();
        });
    }

    show(msg: string): void {
        this.jqObj.show();
        this.jqObj.children("#msg").html(msg);
        this.isShow = true;
        this.timeObj = setTimeout(() => {
            this.hide();
        }, 3000);
    }

    hide(): void {
        if ( this.timeObj ) {
            clearTimeout(this.timeObj);
        }
        this.isShow = false;
        this.jqObj.hide();
    }
}

class DateForm {
    inputDay: any;
    inputTime: any;

    date: Date;

    constructor(inputDay: any, inputTime: any) {
        this.inputDay = inputDay;
        this.inputTime = inputTime;
    }

    init(): void {
        this.date = new Date(this.inputDay.val() + "T" + this.inputTime.val());
    }

    clearError(): void {
        this.inputDay.removeClass("error__border");
        this.inputTime.removeClass("error__border");
    }

    isValid(): boolean {
        this.init();
        if ( !this.inputDay.val() ) {
            this.inputDay.addClass("error__border");
        }
        if ( !this.inputTime.val() ) {
            this.inputTime.addClass("error__border");
        }
        
        return !!this.date.valueOf();;        
    }

    getUrlTime(): string {
        if ( !this.date.valueOf() ) {
            return "";
        }  
        const d: string[] = [
            "" + this.date.getFullYear(),
            this.date.getUTCMonth()  < 9 ? "0" + (this.date.getUTCMonth() + 1) : "" + (this.date.getUTCMonth() + 1),
            this.date.getUTCDate() < 10 ? "0" + this.date.getUTCDate() : "" + this.date.getUTCDate(),
            this.date.getUTCHours() < 10 ? "0" + this.date.getUTCHours() : "" + this.date.getUTCHours(),
            this.date.getUTCMinutes() < 10 ? "0" + this.date.getUTCMinutes() : "" + this.date.getUTCMinutes(),
            this.date.getUTCSeconds() < 10 ? "0" + this.date.getUTCSeconds() : "" + this.date.getUTCSeconds()
        ];
        
        return d.join("/");
    }

    getUnixTime(): number {
        const valueTime = this.date.valueOf();
        if ( valueTime ) {
            return valueTime/1000;
        } 
        return 0;
    }

    deltaTime(dateForm: DateForm): number {
        return this.getUnixTime() - dateForm.getUnixTime();
    }
}