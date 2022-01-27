import NumberPlate = require("./number_plate")
import Setting = require("./setting")
import NumberPlateObserver = require("./number_plate_observer")

import * as PDFMake from 'pdfmake/build/pdfmake'

class Controller extends NumberPlateObserver {
    // ナンバープレートModel
    private numberPlate: NumberPlate;

    public constructor() {
        // 基底クラスのコンストラクタ
        super();

        // キャンパス要素を取得
        var canvas: HTMLCanvasElement = document.getElementById("plate-view") as HTMLCanvasElement;

        this.numberPlate = new NumberPlate(canvas)
        this.numberPlate.init(this.load.bind(this));

        // オブザーバー登録
        this.numberPlate.registObserver(this);
    }

    // 読み込み時処理
    private load() {
        this.numberPlate.drawAll();

        // スケール一覧追加
        const INIT_SCALE_NUM = 24;
        const scaleInput = document.getElementById("scale") as HTMLSelectElement;
        for (let number = 10; number <= 90; number++) {
            // オプション生成
            const option = document.createElement('option');
            option.textContent = "1/" + number.toString();
            option.value = number.toString();

            // 初期選択
            if (INIT_SCALE_NUM == number) {
                option.selected = true;
            }

            scaleInput.appendChild(option);
        }

        //===================================
        // イベント登録
        //===================================
        // ひらがな
        const hiraganaInput = document.getElementById("hiragana") as HTMLInputElement;
        hiraganaInput.oninput = this.changeHiragana.bind(this);

        // 運輸支局
        const kanjiInput = document.getElementById("kanji") as HTMLInputElement;
        kanjiInput.oninput = this.changeKanji.bind(this);

        // 普通自動車/軽自動車
        const normalCarInput = document.getElementById("normal-car") as HTMLInputElement;
        normalCarInput.onclick = this.changeCarType.bind(this);
        const keiCarInput = document.getElementById("kei-car") as HTMLInputElement;
        keiCarInput.onclick = this.changeCarType.bind(this);

        // 自家用車/社用車
        const homeUseInput = document.getElementById("home-use") as HTMLInputElement;
        homeUseInput.onclick = this.changeIsCompany.bind(this);
        const companyUseInput = document.getElementById("company-use") as HTMLInputElement;
        companyUseInput.onclick = this.changeIsCompany.bind(this);

        // 分類番号
        for (let i: number = 1; i <= NumberPlate.SMALL_NUMBER_COUNT; i++) {
            const input = document.getElementById("small_number" + i.toString()) as HTMLSelectElement;
            input.oninput = this.changeSmallNumber.bind(this);
        }
        // 一連指定番号
        for (let i: number = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
            const input = document.getElementById("large_number" + i.toString()) as HTMLSelectElement;
            input.oninput = this.changeLargeNumber.bind(this);
        }

        // pdf関連
        const printButton = document.getElementById("download-button") as HTMLButtonElement;
        printButton.onclick = this.savePDF.bind(this);


        //ローディング画面非表示
        const loadingDiv = document.getElementById("loading") as HTMLDivElement;
        loadingDiv.classList.toggle('is-show');
    }

    //===================================
    // NumberPlateObserver
    //===================================
    onChangeLargeNumber(largeNumberList: string[]) {
        // 一連指定番号
        for (let i: number = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
            const input = document.getElementById("large_number" + i.toString()) as HTMLSelectElement;

            for (let j: number = 0; j < input.options.length; j++) {
                if (input.options[j].value == largeNumberList[i - 1]) {
                    input.options[j].selected = true;
                }
                else {
                    input.options[j].selected = false;
                }
            }
        }
    }


    //===================================
    // View変更時のCallback関数
    //===================================
    // ひらがな変更時callback関数
    changeHiragana() {
        const hiragana_input = document.getElementById("hiragana") as HTMLInputElement;

        const text: string = hiragana_input.value;

        this.numberPlate.setHiragana(text);
    }

    // 運輸支局変更時callback関数
    changeKanji() {
        const kanjiInput = document.getElementById("kanji") as HTMLInputElement;

        const text: string = kanjiInput.value;

        this.numberPlate.setKanji(text);
    }

    // 一連指定番号変更時callback関数
    changeLargeNumber() {
        const largeNumberList: string[] = [];

        for (let i: number = 1; i <= NumberPlate.LARGE_NUMBER_COUNT; i++) {
            const input = document.getElementById("large_number" + i.toString()) as HTMLSelectElement;
            largeNumberList.push(input.value);
        }

        this.numberPlate.setLargeNumber(largeNumberList);
    }

    // 分類番号変更時callback関数
    changeSmallNumber() {
        const smallNumberList: string[] = [];

        for (let i: number = 1; i <= NumberPlate.SMALL_NUMBER_COUNT; i++) {
            const input = document.getElementById("small_number" + i.toString()) as HTMLSelectElement;
            smallNumberList.push(input.value);
        }

        this.numberPlate.setSmallNumber(smallNumberList);
    }

    // 普通自動車/軽自動車変更時callback関数
    changeCarType() {
        const carTypeInput = document.getElementById("normal-car") as HTMLInputElement;

        if (carTypeInput.checked) {
            this.numberPlate.setCarType(NumberPlate.NORMAL_CAR);
        }
        else {
            this.numberPlate.setCarType(NumberPlate.KEI_CAR);
        }
    }

    // 自家用車/社用車変更時callback関数
    changeIsCompany() {
        const carTypeInput = document.getElementById("home-use") as HTMLInputElement;

        if (carTypeInput.checked) {
            this.numberPlate.setIsCompany(false);
        }
        else {
            this.numberPlate.setIsCompany(true);
        }
    }

    //===================================
    // PdfMake関連
    //===================================
    // pdfを表示する
    savePDF() {
        const docDefinition = this.createDocDefinition();

        PDFMake.createPdf(docDefinition).open();
    }

    // pdfを印刷する
    // @note iOS版Safariで動作せず。
    printPDF() {
        const docDefinition = this.createDocDefinition();

        PDFMake.createPdf(docDefinition).print();
    }

    createDocDefinition(){
        //===================================
        // 各種寸法作成
        //===================================
        // スケール取得
        const scaleInput = document.getElementById("scale") as HTMLSelectElement;
        const scale_text = scaleInput.value;

        // 描画するプレートのサイズを計算
        const scale = 1 / Number(scale_text);
        const plateWidth = Setting.mm2pt(Setting.PLATE_WIDTH_MM * scale);

        // 各種マージン
        const plateMargin = Setting.mm2pt(10);
        const pageMargin = Setting.mm2pt(20);

        // ナンバープレート画像取得
        const small_base64 = this.numberPlate.toDataURL();
        this.numberPlate.setIsLarge(true);
        const large_base64 = this.numberPlate.toDataURL();
        this.numberPlate.setIsLarge(false);

        // pdf設定
        const docDefinition = {
            pageSize: "A4" as any,
            pageMargins: pageMargin,
            content: [
                {
                    columns: [
                        {
                            image: small_base64,
                            width: plateWidth,
                        },
                        {
                            text: "",
                            width: plateMargin
                        },
                        {
                            image: large_base64,
                            width: plateWidth
                        },
                        {
                            text: "",
                            width: plateMargin
                        },
                        {
                            image: small_base64,
                            width: plateWidth,
                        },
                        {
                            text: "",
                            width: plateMargin
                        },
                        {
                            image: large_base64,
                            width: plateWidth,
                        }
                    ]
                }
            ]
        };

        return docDefinition;
    }
}

export = Controller;