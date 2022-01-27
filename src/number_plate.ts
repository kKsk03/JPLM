import NumberPlateObserver = require("./number_plate_observer")
import CanvasWrapper = require("./canvas_wrapper")
import FontType = require("./FontType")
import Setting = require("./setting")

class NumberPlate {
    // 書き込み情報
    private smallNumberList: string[] = ["3", "0", "0"];
    private largeNumberList: { number: string, is_dot: boolean }[] = [
        { number: "1", is_dot: false },
        { number: "2", is_dot: false },
        { number: "3", is_dot: false },
        { number: "4", is_dot: false }
    ];

    public static readonly SMALL_NUMBER_COUNT: number = 3;
    public static readonly LARGE_NUMBER_COUNT: number = 4;

    private hiragana: string = "さ";
    private kanji: string = "横浜";

    private carType: number = NumberPlate.NORMAL_CAR;
    public static readonly NORMAL_CAR: number = 0;
    public static readonly KEI_CAR: number = 1;

    private isCompany: boolean = false;

    // 留め具のサイズ
    private isLargeBolt:boolean = false;

    // 書き込み先
    private canvas: CanvasWrapper;

    // オブザーバー一覧
    private obserber_list: NumberPlateObserver[] = [];
    public registObserver(observer: NumberPlateObserver) {
        this.obserber_list.push(observer);
    }

    public constructor(canvas: HTMLCanvasElement) {
        this.canvas = new CanvasWrapper(canvas);

        this.canvas.setSize(Setting.CANVAS_SIZE);
    }

    // 初期化
    public init(callback: () => void) {
        this.canvas.init(callback);
    }

    public toDataURL(): string {
        return this.canvas.toDataURL();
    }

    // セッター
    public setCarType(car_type: number) {
        this.carType = car_type;

        this.drawAll();
    }

    public setIsCompany(is_company: boolean) {
        this.isCompany = is_company;

        this.drawAll();
    }

    public setIsLarge(isLargeBolt: boolean){
        this.isLargeBolt = isLargeBolt;

        this.drawAll();
    }

    public setHiragana(hiragana: string) {
        this.hiragana = hiragana.slice(0, 1);
        this.hiragana = hiragana;

        // オブザーバーへ変更を通知
        this.obserber_list.forEach(observer => {
            observer.onChangeHiragana(this.hiragana);
        });

        this.drawAll();
    }

    public setKanji(kanji: string) {
        this.kanji = kanji;

        // オブザーバーへ変更を通知
        this.obserber_list.forEach(observer => {
            observer.onChagneKanji(this.kanji);
        });

        this.drawAll();
    }

    public setSmallNumber(smallNumberList: string[]) {
        if (smallNumberList.length != NumberPlate.SMALL_NUMBER_COUNT) {
            return;
        }

        for (let i: number = 0; i < NumberPlate.SMALL_NUMBER_COUNT; i++) {
            let number_char = " "
            if (CanvasWrapper.isNumber(smallNumberList[i])) {
                number_char = smallNumberList[i];
            }

            this.smallNumberList[i] = number_char;
        }

        // オブザーバーへ変更を通知
        this.obserber_list.forEach(observer => {
            observer.onChangeSmallNumber(this.smallNumberList);
        });

        this.drawAll();
    }

    public setLargeNumber(largeNumberList: string[]) {
        if (largeNumberList.length != NumberPlate.LARGE_NUMBER_COUNT) {
            return;
        }

        // 数値判定用正規表現
        const reg = /[0-9]/;

        const dot_char = "・";
        // 数字以外の入力はドットに置換
        for (let i: number = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            if (!reg.test(largeNumberList[i])) {
                largeNumberList[i] = dot_char;
            }
        }

        // 値の格納
        for (let i: number = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            if (largeNumberList[i] != dot_char) {
                this.largeNumberList[i].number = largeNumberList[i];
            }
        }

        // ドットの処理
        // 変更されたインデックスを取得
        let change_index = -1;
        for (let i: number = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            const is_dot = largeNumberList[i] == dot_char;
            if (is_dot != this.largeNumberList[i].is_dot) {
                change_index = i;
            }
            this.largeNumberList[i].is_dot = is_dot;
        }

        // ドットの修正
        if(change_index == -1){

        }
        // 数値→ドットの変更の場合、変更点より左側もすべてドットに変更
        else if (this.largeNumberList[change_index].is_dot == true) {
            for (let i: number = 0; i < change_index; i++) {
                this.largeNumberList[i].is_dot = this.largeNumberList[change_index].is_dot
            }
        }
        // ドット→数値の変更の場合、変更点よりも右側をすべてドットに変更
        else{
            for (let i: number = change_index; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
                this.largeNumberList[i].is_dot = this.largeNumberList[change_index].is_dot
            }
        }

        // オブザーバーへ変更を通知
        const changedLargeNumberList: string[] = []
        for (let i: number = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            if (this.largeNumberList[i].is_dot) {
                changedLargeNumberList.push(dot_char);
            }
            else {
                changedLargeNumberList.push(this.largeNumberList[i].number);
            }
        }
        this.obserber_list.forEach(observer => {
            observer.onChangeLargeNumber(changedLargeNumberList);
        });

        this.drawAll();
    }


    // 描画
    private drawHiragana() {
        const drawSetting = Setting.drawSetting["hiragana"];
        this.canvas.drawChar(this.hiragana, drawSetting.size, drawSetting.position, this.getColor(), CanvasWrapper.KEEP_ASPECT, FontType.SELF);
    }

    private drawKanji() {
        const kanjiList: string[] = this.kanji.split("");

        const wordCount = Math.min(kanjiList.length, 4);

        for (let i: number = 0; i < wordCount; i++) {
            const setting_key = "kanji" + wordCount.toString() + "-" + (i + 1).toString();
            const drawSetting = Setting.drawSetting[setting_key];
            this.canvas.drawChar(kanjiList[i], drawSetting.size, drawSetting.position, this.getColor(), drawSetting.tr_option);
        }
    }

    private drawLargeNumber() {
        let isDrawHyphen = true;

        for (let i: number = 0; i < NumberPlate.LARGE_NUMBER_COUNT; i++) {
            const setting_key = "large_number" + (i + 1).toString();
            const drawSetting = Setting.drawSetting[setting_key];

            if (this.largeNumberList[i].is_dot) {
                this.canvas.drawChar("・", drawSetting.size, drawSetting.position, this.getColor());
            }
            else {
                this.canvas.drawChar(this.largeNumberList[i].number, drawSetting.size, drawSetting.position, this.getColor());
            }
            if (this.largeNumberList[i].is_dot) {
                isDrawHyphen = false;
            }
        }

        if (isDrawHyphen) {
            this.drawHyphen();
        }
    }

    private drawSmallNumber() {
        const drawSmallNumberList: string[] = [];

        for (let i: number = 0; i < NumberPlate.SMALL_NUMBER_COUNT; i++) {
            if (this.smallNumberList[i] != " ") {
                drawSmallNumberList.push(this.smallNumberList[i]);
            }
        }

        for (let i: number = 0; i < drawSmallNumberList.length; i++) {
            const setting_key = "small_number" + drawSmallNumberList.length + "-" + (i + 1).toString();
            const drawSetting = Setting.drawSetting[setting_key];

            this.canvas.drawChar(drawSmallNumberList[i], drawSetting.size, drawSetting.position, this.getColor());
        }
    }

    // ハイフンの描写
    private drawHyphen() {
        const drawSetting = {
            position: {
                x: Setting.mm2px(177.5),
                y: Setting.mm2px(104),
            },
            size: {
                width: Setting.mm2px(20),
                height: Setting.mm2px(12)
            }
        }

        this.canvas.drawRect(drawSetting.size, drawSetting.position, this.getColor());
    }

    private drawBolt(){
        let drawSetting1 = this.isLargeBolt ? Setting.drawSetting["bolt1_large"] : Setting.drawSetting["bolt1"];
        const drawSetting2 = Setting.drawSetting["bolt2"];

        this.canvas.drawCircle(drawSetting1.size, drawSetting1.position, "#9a9e9d")
        this.canvas.drawCircle(drawSetting2.size, drawSetting2.position, "#9a9e9d")
    }

    // 色取得
    private getColor(): string {
        if (this.isCompany) {
            if (this.carType == NumberPlate.NORMAL_CAR) {
                return Setting.FRONT_COLOR[Setting.NORMAL_COMPANY_CAR];
            }
            else if (this.carType == NumberPlate.KEI_CAR) {
                return Setting.FRONT_COLOR[Setting.KEI_COMPANY_CAR];
            }
        }

        if (this.carType == NumberPlate.NORMAL_CAR) {
            return Setting.FRONT_COLOR[Setting.NORMAL_CAR];
        }
        else if (this.carType == NumberPlate.KEI_CAR) {
            return Setting.FRONT_COLOR[Setting.KEI_CAR];
        }

        return Setting.FRONT_COLOR[Setting.NORMAL_CAR];
    }

    // 背景色取得
    private getBgColor(): string {
        if (this.isCompany) {
            if (this.carType == NumberPlate.NORMAL_CAR) {
                return Setting.BG_COLOR[Setting.NORMAL_COMPANY_CAR];
            }
            else if (this.carType == NumberPlate.KEI_CAR) {
                return Setting.BG_COLOR[Setting.KEI_COMPANY_CAR];
            }
        }

        if (this.carType == NumberPlate.NORMAL_CAR) {
            return Setting.BG_COLOR[Setting.NORMAL_CAR];
        }
        else if (this.carType == NumberPlate.KEI_CAR) {
            return Setting.BG_COLOR[Setting.KEI_CAR];
        }

        return Setting.BG_COLOR[Setting.NORMAL_CAR];
    }

    // すべて塗りつぶす
    private deleteAll() {
        this.canvas.drawRect(Setting.CANVAS_SIZE, { x: 0, y: 0 }, this.getBgColor());
    }

    // 描写する
    public drawAll() {
        this.deleteAll();

        this.drawKanji();
        this.drawHiragana();
        this.drawSmallNumber();
        this.drawLargeNumber();

        this.drawBolt();
    }
}


export = NumberPlate;