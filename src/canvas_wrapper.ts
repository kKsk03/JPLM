import * as WebfontLoader from 'webfontloader'
import FontType = require("./FontType")

interface Size {
    width: number,
    height: number
}

interface Position {
    x: number,
    y: number
}

// コンストラクタで与えらえたcanvasに描画する
class CanvasWrapper {
    //Webフォントの名前
    private readonly hiraganaFontName: string = 'Hiragana';
    private readonly kanjiFontName: string = 'Kanji';

    private readonly hiraganaCSS: string = '/css/hiragana.css';
    private readonly kanjiCSS: string = '/css/kanji.css';

    // キャンバス
    private canvas: HTMLCanvasElement;

    // 画像データ
    private numberImg: { [key: string]: HTMLImageElement; } = {};;

    private readonly IMAGE_FILE_NAME_LIST: string[] = [
        "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "・"
    ]

    // tr_option
    public static readonly FIXED: number = 0;
    public static readonly FIXED_WIDTH: number = 1;
    public static readonly FIXED_HEIGHT: number = 2;
    public static readonly KEEP_ASPECT: number = 3;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
    }

    // 初期化
    init(callback: () => void) {

        let load_num = this.IMAGE_FILE_NAME_LIST.length + 1;

        const func = function () {
            load_num = load_num - 1;
            if (load_num == 0) {
                callback();
            }
        }

        // Webフォントの読み込み
        WebfontLoader.load({
            custom: {
                families: [this.hiraganaFontName, this.kanjiFontName],
                urls: [this.hiraganaCSS, this.kanjiCSS]
            },
            active: func,
            inactive: this.toDataURL.bind(this),
        });

        // 画像の読み込み
        for (let i: number = 0; i < this.IMAGE_FILE_NAME_LIST.length; i++) {
            const fileName = this.IMAGE_FILE_NAME_LIST[i];
            const filePath = "img/" + fileName + ".png";

            this.numberImg[fileName] = new Image();
            this.numberImg[fileName].src = filePath;

            this.numberImg[fileName].onload = func;
        }
    }

    // canvasの画像をDataURL形式の文字列として返す
    public toDataURL(): string {
        return this.canvas.toDataURL();
    }

    // キャンバスのサイズを設定する
    public setSize(size: Size) {
        this.canvas.width = size.width;
        this.canvas.height = size.height;
    }

    // 円を描画する
    public drawCircle(size: Size, position: Position, color: string) {
        if (!this.canvas.getContext) {
            return;
        }

        const context = this.canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.beginPath();

        context.arc(position.x, position.y, size.width / 2, 0 * Math.PI / 180, 360 * Math.PI / 180, false);
        context.fillStyle = color;
        context.fill();
    }

    // 矩形を描画する
    public drawRect(size: Size, position: Position, color: string) {
        if (!this.canvas.getContext) {
            return;
        }

        const context = this.canvas.getContext('2d');
        if (!context) {
            return;
        }
        // 現在の文字を消す
        context.fillStyle = color;
        context.fillRect(position.x, position.y, size.width, size.height);
    }

    // 1文字を指定されたサイズ・位置・色で描画する
    // 数字に関しては画像データ(number_img)を利用して描画する
    public drawChar(char: string, size: Size, position: Position, color: string, trOption = CanvasWrapper.KEEP_ASPECT, fontType: FontType = FontType.SANS_SELF) {
        // 一文字に制限
        char = char.slice(0, 1);

        if (this.canDrawImage(char)) {
            this.drawNumberChar(char, size, position, color);
        }

        else {
            this.drawJpChar(char, size, position, color, trOption, fontType);
        }
    }

    // 引数に与えられた文字が数値文字であるかを返す。
    public static isNumber(char: string): boolean {
        const reg = /[0-9]/
        return reg.test(char);
    }

    // 引数に与えられた文字の画像が用意されている場合true
    public canDrawImage(char: string): boolean {
        if (this.IMAGE_FILE_NAME_LIST.indexOf(char) == -1) {
            return false;
        }

        return true;
    }

    // 指定された数字一文字を指定されたサイズ・位置・色で描画する
    private drawNumberChar(char: string, size: Size, position: Position, color: string) {
        if (!this.canvas.getContext) {
            return;
        }

        // 画像取得
        const img = this.numberImg[char];

        // colorで塗りつぶされた文字の作成
        const memCanvas = document.createElement("canvas");
        memCanvas.width = img.naturalWidth;
        memCanvas.height = img.naturalHeight;
        const mem_context = memCanvas.getContext('2d');
        if (!mem_context) {
            return;
        }

        // 一度すべてcolorで塗りつぶす
        mem_context.fillStyle = color;
        mem_context.fillRect(0, 0, memCanvas.width, memCanvas.height);

        // 画像ファイルでマスキング
        mem_context.globalCompositeOperation = 'destination-in';
        mem_context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);

        // 作成した文字を描写
        const context = this.canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.drawImage(memCanvas, position.x, position.y, size.width, size.height);
    }

    // 1文字を指定されたサイズ・位置・色で描画する
    private drawJpChar(char: string, size: Size, position: Position, color: string, trOption = CanvasWrapper.KEEP_ASPECT, fontType = FontType.SANS_SELF) {
        const MEM_CANVAS_HEIGHT = 500;
        const MEM_CANVAS_WIDTH = 500;

        // 文字画像データ作成用キャンパス作成
        const memCanvas = document.createElement("canvas");
        memCanvas.height = MEM_CANVAS_HEIGHT;
        memCanvas.width = MEM_CANVAS_WIDTH;

        // 文字の描写
        const context = memCanvas.getContext('2d');
        if (!context) {
            return;
        }

        context.fillStyle = "rgba(0, 0, 0, 0)";
        context.fillRect(0, 0, MEM_CANVAS_WIDTH, MEM_CANVAS_HEIGHT);

        context.fillStyle = color;

        if (fontType == FontType.SELF) {
            context.font = "300px " + this.hiraganaFontName;
        }
        else {
            context.font = "300px " + this.kanjiFontName;
        }

        context.textAlign = "left";
        context.textBaseline = "top";
        context.fillText(char, 0, 0);

        // 文字を覆う座標を取得
        var pixels = context.getImageData(0, 0, MEM_CANVAS_WIDTH, MEM_CANVAS_HEIGHT);
        var data = pixels.data;
        var left = MEM_CANVAS_WIDTH;
        var right = 0;
        var top = MEM_CANVAS_HEIGHT;
        var bottom = 0;
        for (var i = 0, len = data.length; i < len; i += 4) {
            var r = data[i], g = data[i + 1], b = data[i + 2], alpha = data[i + 3];
            if (alpha > 0) {
                var col = Math.floor((i / 4) % memCanvas.width);
                var row = Math.floor((i / 4) / memCanvas.width);

                if (left > col) left = col;
                if (right < col) right = col;
                if (top > row) top = row;
                if (bottom < row) bottom = row;
            }
        }

        let charSize: Size = { width: right - left + 1, height: bottom - top + 1 };

        if (charSize.width / size.width < charSize.height / size.height) {
            if (trOption === CanvasWrapper.KEEP_ASPECT || trOption == CanvasWrapper.FIXED_HEIGHT) {
                const new_w = charSize.height * size.width / size.height;
                left -= Math.ceil((new_w - charSize.width) / 2);
                right += Math.ceil((new_w - charSize.width) / 2);
                charSize.width = right - left + 1;
            }
        }
        else {
            if (trOption === CanvasWrapper.KEEP_ASPECT || trOption == CanvasWrapper.FIXED_WIDTH) {
                const new_h = charSize.width * size.height / size.width;
                top -= Math.ceil((new_h - charSize.height) / 2);
                bottom += Math.ceil((new_h - charSize.height) / 2);
                charSize.height = bottom - top + 1;
            }
        }


        // 描写
        if (!this.canvas.getContext) {
            return;
        }

        const canvasContext = this.canvas.getContext('2d');
        if (!canvasContext) {
            return;
        }
        canvasContext.drawImage(memCanvas, left, top, charSize.width, charSize.height, position.x, position.y, size.width, size.height);
    }
}

export = CanvasWrapper;