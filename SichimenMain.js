const ImgsNum = 3; // この値は静的な画像数なのでそのまま

const header = document.getElementById('header');
const title = document.getElementById('title');
const ctxtitle = title.getContext('2d');
const home = document.getElementById('home');
const totobox = document.getElementById('totobox');
const about = document.getElementById('about');
const past = document.getElementById('past');
const gallery = document.getElementById('gallery');
const team = document.getElementById('team');
const callfor = document.getElementById('callfor');
const contact = document.getElementById('contact');
const footer = document.getElementById('footer');

const cal = new Array(); // cal画像（Imageオブジェクト）を格納
const img = new Array(); // img要素（HTMLImageElement）を格納
const news = new Array();
const zooms = new Array(); // zoom画像（Imageオブジェクト）を格納
const newsCan = new Array();
const ctxnews = new Array();
const newszoomCan = new Array();
const ctxnewszoom = new Array();
const ctxcal = new Array(); // cal用CanvasRenderingContext2Dを格納

let pointstart;
let pointend;
let pointmove;
window.scrollTo(0, 0);

const gallery_map = document.getElementById("gallery_map");
const team_container = document.getElementById('team_container');

// ★★★ 変更点: DOMContentLoadedイベントリスナー内でデータロードの待機方法を変更 ★★★
window.addEventListener('DOMContentLoaded', () => {
    // data.js からの 'exhibitionsLoaded' イベントをリッスン
    window.addEventListener('exhibitionsLoaded', (event) => {
        const exhibitionsData = event.detail.exhibitions;
        const formattedDatesData = event.detail.formattedDates;

        const DMNum = exhibitionsData.length; // DMNum を展示会データの総数に設定

        // 既存のモバイル判定ロジックはDOMContentLoaded直下に置く
        if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) && window.orientation === 0) {
            gallery_map.style.width = "450px";
            contact.style.width = "450px";
            team.style.width = "450px";
            team.style.height = "1700px";
            team_container.style.height = "1500px";
            callfor.style.paddingBottom = "200px";
            gallery.style.width = "450px";
            footer.style.width = "450px";
            header.style.width = "450px";
        }

        menuSet(); // メニュー設定はデータロード前に実行可能

        // misc画像のロード
        const misc = new Image();
        misc.src = `../img/misc.png`; // misc.pngのパス

        // 各要素の生成と初期化 (DOM要素の生成は、データロードを待たずにここで行う)
        for (let i = 0; i < DMNum; i++) {
            cal[i] = document.createElement('canvas');
            cal[i].className = 'cal';
            cal[i].id = `cal-${i}`;
            document.getElementById('achives_box').appendChild(cal[i]);
            ctxcal[i] = cal[i].getContext('2d');

            // img[i] (HTMLImageElement) はDOMに挿入されないが、後でcanvas描画に使うため用意
            img[i] = document.createElement('img'); 
            img[i].className = 'img';
            img[i].id = `img-${i}`;
            // img[i].src と alt は後述の画像ロード処理で設定

            news[i] = document.createElement('div');
            news[i].className = 'news';
            news[i].id = `news-${i}`;
            news[i].textContent = exhibitionsData[i].name; 
            document.getElementById('news_ul').appendChild(news[i]);

            // zooms[i] (HTMLImageElement) もDOMに挿入されないが、後でcanvas描画に使うため用意
            zooms[i] = document.createElement('img');
            zooms[i].className = 'zoomimg';
            zooms[i].id = `zoomimg-${i}`;
            // zooms[i].src と alt は後述の画像ロード処理で設定

            newsCan[i] = document.createElement('canvas');
            newsCan[i].className = 'newsCan';
            newsCan[i].id = `newsCan-${i}`;
            document.getElementById('news_li').appendChild(newsCan[i]);
            ctxnews[i] = newsCan[i].getContext('2d');

            newszoomCan[i] = document.createElement('canvas');
            newszoomCan[i].className = 'newszoomCan';
            newszoomCan[i].id = `newszoomCan-${i}`;
            document.getElementById('news_li_top').appendChild(newszoomCan[i]);
            ctxnewszoom[i] = newszoomCan[i].getContext('2d');
        }

        // img[1], img[2], img[3] のロード (静的な画像)
        for (let i = 1; i <= ImgsNum; i++) {
            img[i] = new Image();
            img[i].src = `../img/img${i}.jpg`;
        }

        misc.onload = function() {
            ctxtitle.drawImage(misc, 0, 0, 400, 50, 0, 0, 400, 50);
        };

        // cal画像とzoom画像のロード状況を監視
        let loadedCount = 0;
        const totalDynamicImages = DMNum * 2; // cal と zoom の合計数
        
        // Load dynamic images (cal and zoom)
        for (let i = 0; i < DMNum; i++) {
            const exhibition = exhibitionsData[i];

            // calImageのロード
            const calImage = new Image();
            if (exhibition.calImage && exhibition.calImage.filename && exhibition.calImage.extension) {
                calImage.src = `img/calimg/${exhibition.calImage.filename}.${exhibition.calImage.extension}`;
                calImage.alt = `cal_img_${exhibition.name}`;
            } else {
                calImage.src = 'img/placeholder.webp'; 
                calImage.alt = 'No image available';
            }
            // cal[i] にロードしたImageオブジェクトを格納
            cal[i] = calImage; 
            calImage.onload = () => {
                loadedCount++;
                if (loadedCount === totalDynamicImages) {
                    initAfterImagesLoaded(DMNum, exhibitionsData, formattedDatesData);
                }
            };
            calImage.onerror = () => {
                console.warn(`Failed to load cal image: ${calImage.src}`);
                loadedCount++;
                if (loadedCount === totalDynamicImages) {
                    initAfterImagesLoaded(DMNum, exhibitionsData, formattedDatesData);
                }
            };

            // zoomImageのロード
            const zoomImage = new Image();
            if (exhibition.zoomImage && exhibition.zoomImage.filename && exhibition.zoomImage.extension) {
                zoomImage.src = `img/calzoom/${exhibition.zoomImage.filename}.${exhibition.zoomImage.extension}`;
                zoomImage.alt = `zoom_img_${exhibition.name}`;
            } else {
                zoomImage.src = 'img/placeholder_zoom.webp'; 
                zoomImage.alt = 'No zoom image available';
            }
            // zooms[i] にロードしたImageオブジェクトを格納
            zooms[i] = zoomImage; 
            zoomImage.onload = () => {
                loadedCount++;
                if (loadedCount === totalDynamicImages) {
                    initAfterImagesLoaded(DMNum, exhibitionsData, formattedDatesData);
                }
            };
            zoomImage.onerror = () => {
                console.warn(`Failed to load zoom image: ${zoomImage.src}`);
                loadedCount++;
                if (loadedCount === totalDynamicImages) {
                    initAfterImagesLoaded(DMNum, exhibitionsData, formattedDatesData);
                }
            };
        }

    });
});

// 画像ロード後に呼び出される初期化関数
function initAfterImagesLoaded(DMNum, exhibitionsData, formattedDatesData) {
    RoomPrepar(); 
    gapi.load('client', Gcalender); // GoogleカレンダーAPIのロード（APIキーは別途設定）

    // 各関数の呼び出し
    Main_Load(DMNum, exhibitionsData, formattedDatesData); 
    NewsEvent(DMNum, exhibitionsData, formattedDatesData); 
    NowaDayNews(DMNum, exhibitionsData); 
    
    Init(); 
    Header();
    footer_create();
    Title_create();
    About();
    Gallery();
    Team();
    Contact();
    CallFor();
    ScrollSetting();
    Page_move();
    
    HoverEvents(DMNum); 
    ClickEvents(DMNum); 
}

if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
    pointstart = `touchstart`;
    pointend = `touchend`;
    pointmove = `touchmove`;
} else {
    pointstart = "mouseover";
    pointend = "mouseleave";
    pointmove = "mousemove";
}

function RoomPrepar() {
    let inboxCan;
    if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) && window.orientation === 0) {
        home.insertAdjacentHTML("beforebegin", `<div id="toproom" style=" visibility: hidden; position: absolute; background-color: #9b846d; height: 500px;width: 450px;top: 50px; left: 0; right:0; margin: auto; z-index:1;"></div>`);
        let calendar_container = document.getElementById("calendar_container");
        calendar_container.style.left = "-80px";
    } else {
        home.insertAdjacentHTML("beforebegin", `<div id="toproom" style=" visibility: hidden; position: absolute; background-color: #9b846d; height: 500px;width: 800px;top: 50px; left: 0; right:0; margin: auto; z-index:1;"></div>`);
    }
    PopAnim(document.getElementById('toproom'), 5000, 0);
}

// ★★★ 変更点: Main_Load 関数の引数と内容を更新 ★★★
function Main_Load(DMNum, exhibitionsData, formattedDatesData) {
    for (let i = 0; i < DMNum; i++) {
        // カレンダーイメージの描画
        if (cal[i] && cal[i].complete && ctxcal[i]) { // 画像がロード済みであることを確認
            ctxcal[i].clearRect(0, 0, ctxcal[i].canvas.width, ctxcal[i].canvas.height);
            ctxcal[i].drawImage(cal[i], 0, 0, cal[i].width, cal[i].height, 0, 0, ctxcal[i].canvas.width, ctxcal[i].canvas.height);
        } else if (ctxcal[i]) {
            console.warn(`Cal image for index ${i} not yet loaded for Main_Load.`);
            // 必要に応じてプレースホルダーやロード中表示
        }
        
        // テキスト情報の描画
        ctxcal[i].font = '16px "Noto Sans JP"';
        ctxcal[i].textAlign = 'center';
        ctxcal[i].fillStyle = 'rgb(28,28,28)';

        // 年月日と曜日
        ctxcal[i].fillText(exhibitionsData[i].year, 150, 40);
        ctxcal[i].fillText(formattedDatesData[i], 150, 65);

        // イベント名
        ctxcal[i].font = '19px "Noto Sans JP"';
        ctxcal[i].fillText(exhibitionsData[i].name, 150, 100);

        // 出展者
        ctxcal[i].font = '14px "Noto Sans JP"';
        ctxcal[i].fillText(exhibitionsData[i].exhibitors.join(', '), 150, 130); 
    }
}


// ★★★ 変更点: NewsEvent 関数の引数と内容を更新 ★★★
function NewsEvent(DMNum, exhibitionsData, formattedDatesData) {
    // ニュース表示の初期設定
    // DOM要素の生成は一度だけ行うべきなので、RoomPreparから移動 (初回のみ実行されるようにチェックを追加)
    if (document.getElementById('newsflexbox') === null) { 
        if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) && window.orientation === 0) {
            document.getElementById('toproom').insertAdjacentHTML("afterbegin", `<div id="newsflexbox" style="position:absolute; margin: auto; top: 510px;right: 0;bottom: 0;"></div>`);
            document.getElementById('toproom').insertAdjacentHTML("afterend",
                `<div id="newszoombox" style="width:400px;height:600px;background-color: #110501df; visibility: hidden; z-index:4; position:absolute; margin: 0px auto 0px auto; top: 100px;left: 0; right: 0;"></div>`);
            document.getElementById('newszoombox').insertAdjacentHTML("afterbegin",
                `<div id="newszoomflex" style="width:400px;height:600px; gap:800px 800px; display:flex; overflow: hidden; position:absolute; margin: auto;"></div>`);
        } else {
            document.getElementById('toproom').insertAdjacentHTML("afterbegin", `<div id="newsflexbox" style="position:absolute; margin: auto; top: 510px;right: 0;bottom: 0;left: 450px;"></div>`);
            document.getElementById('toproom').insertAdjacentHTML("afterend",
                `<div id="newszoombox" style="width:850px;height:600px;background-color: #110501df; visibility: hidden; z-index:4; position:absolute; margin: 0px auto 0px auto; top: 100px;left: 0; right: 0;"></div>`);
            document.getElementById('newszoombox').insertAdjacentHTML("afterbegin",
                `<div id="newszoomflex" style="width:850px;height:600px; gap:800px 800px; display:flex; overflow: hidden; position:absolute; margin: auto;"></div>`);
        }
        var newsflexbox = document.getElementById('newsflexbox');
        var newszoomflex = document.getElementById('newszoomflex');
        newszoombox.insertAdjacentHTML("beforeend",
            `<div class="newsturnleft" style="font-size:xxx-large; transform: scaleY(3); float:left;width: 20px;height: 100px; position:absolute;top: 50%; color: #8e8b88;">≪</div><div class="newsturnright" style="transform: scaleY(3); font-size:xxx-large; float:right;width: 20px;height: 100px;position:absolute;top: 50%; right: 0px; color: #8e8b88;">≫</div>`);
        newsflexbox.insertAdjacentHTML("afterbegin",
            `<div id="newsflex" style=" display:flex; overflow: hidden; height: 160px; width: 350px; margin: auto;background-color: #241f17;"></div>`);
        newsflexbox.insertAdjacentHTML("beforeend",
            `<div class="newsturnleft" style="float:left;width: 20px;height: 100px;z-index:1; position:absolute;top: 20px;"></div><div class="newsturnright" style="float:right;width: 20px;height: 100px;position:absolute;top: 20px;right: 0px;z-index:1;"></div>`);
    }

    var newsflex = document.getElementById(`newsflex`);

    for (let i = 0; i < DMNum; i++) { 
        const exhibition = exhibitionsData[i];
        const formattedDate = formattedDatesData[i]; 
        const calImage = cal[i]; // ロード済みImageオブジェクト
        const zoomImage = zooms[i]; // ロード済みImageオブジェクト

        // ニュースアイテムの既存要素があれば更新、なければ新規作成
        let newsboxElem = document.getElementById(`newsbox${i}`);
        let newsCanElem = document.getElementById(`news${i}`);
        let newstexElem = document.getElementById(`newtex${i}`);
        let newszoomboxElem = document.getElementById(`newszoombox${i}`);
        let newszoomCanElem = document.getElementById(`newszooms${i}`);

        if (!newsboxElem) { // 要素がまだ作成されていない場合
            // calImage.width, calImage.height はロード後に利用可能
            var newsimgheight = calImage.height * 0.6; 
            var newsimgwidth = calImage.width * 0.6; 
            if (calImage.height == 200) { 
                newsimgwidth = calImage.width * 0.4; 
                newsimgheight = calImage.height * 0.4; 
            }
            newsflex.insertAdjacentHTML("beforeend", `<div id="newsbox${i}" style="width: 150px;height:100px; margin: 1%;"><canvas id="news${i}" width="${newsimgwidth}px" height="${newsimgheight}px" style=" margin: 10px 0 0 10px;"></canvas></div>`);
            newsboxElem = document.getElementById(`newsbox${i}`);
            newsCanElem = document.getElementById(`news${i}`);
            ctxnews[i] = newsCanElem.getContext('2d'); 
            newsboxElem.insertAdjacentHTML("beforeend", `<div id="newtex${i}" style="margin: -0px 0px 0px 5px; color: #988; width:150px;"><p style="font-size: 12px;margin:0px;">${exhibition.name}<br><font style="font-size: xx-small;">${formattedDate}<br>${exhibition.time || ''}</font></p></div>`);
            newstexElem = document.getElementById(`newtex${i}`);

            if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) && window.orientation === 0) {
                var newszoomheight = zoomImage.height / 2; 
                var newszoomwidth = zoomImage.width / 2; 
                if (zoomImage.height == 800) { 
                    newszoomheight = zoomImage.height * 0.7 / 2; 
                    newszoomwidth = zoomImage.width * 0.7 / 2; 
                }
                newszoomflex.insertAdjacentHTML("beforeend",
                    `<div id="newszoombox${i}" style="width: 425px;height:300px; flex-shrink: 0;"><canvas id="newszooms${i}" width="${newszoomwidth}px" height="${newszoomheight}px" style=" margin: 25px;"></canvas></div>`);

            } else {
                var newszoomheight = zoomImage.height; 
                var newszoomwidth = zoomImage.width; 
                if (zoomImage.height == 800) { 
                    newszoomheight = zoomImage.height * 0.7; 
                    newszoomwidth = zoomImage.width * 0.7; 
                }
                newszoomflex.insertAdjacentHTML("beforeend",
                    `<div id="newszoombox${i}" style="width: 850px;height:600px; flex-shrink: 0;"><canvas id="newszooms${i}" width="${newszoomwidth}px" height="${newszoomheight}px" style=" margin: 25px;"></canvas></div>`);
            }
            newszoomboxElem = document.getElementById(`newszoombox${i}`);
            newszoomCanElem = document.getElementById(`newszooms${i}`);
            ctxnewszoom[i] = newszoomCanElem.getContext('2d'); 
        }
        
        // Canvasの描画とテキストの更新 (初回生成時とデータ更新時に実行)
        // ここではロード済みのImageオブジェクトを直接drawImageに渡す
        if (calImage && calImage.complete && ctxnews[i]) {
            ctxnews[i].clearRect(0, 0, newsCanElem.width, newsCanElem.height); 
            ctxnews[i].drawImage(calImage, 0, 0, calImage.width, calImage.height, 0, 0, newsCanElem.width, newsCanElem.height);
        }

        if (zoomImage && zoomImage.complete && ctxnewszoom[i]) {
            ctxnewszoom[i].clearRect(0, 0, newszoomCanElem.width, newszoomCanElem.height); 
            ctxnewszoom[i].drawImage(zoomImage, 0, 0, zoomImage.width, zoomImage.height, 0, 0, newszoomCanElem.width, newszoomCanElem.height);
        }

        // テキストコンテンツの更新
        newstexElem.querySelector('p').innerHTML = `${exhibition.name}<br><font style="font-size: xx-small;">${formattedDate}<br>${exhibition.time || ''}</font>`;

    }
    NewsZoomer(); 
    NowaDayNews(DMNum, exhibitionsData); 

    // totobox以下の要素の生成はNewsEventの初回呼び出し時にのみ行う
    if (document.getElementById('toto') === null) {
        if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) && window.orientation === 0) {
            totobox.insertAdjacentHTML("afterbegin", `<canvas id="toto" width="200px" height="200px" style="position:absolute; margin: auto;top: 380px;right: 0px;left: 250px; z-index:3;"></canvas>`);
        } else {
            totobox.insertAdjacentHTML("afterbegin", `<canvas id="toto" width="200px" height="200px" style="position:absolute; margin: auto;top: 680px;right: 0px;left: ${window.innerWidth-200}px; z-index:3;"></canvas>`);
        }
        const toto = document.getElementById('toto');
        var ctxtoto = toto.getContext('2d');
        // misc画像がロードされていることを確認してから描画
        if (misc && misc.complete) {
            ctxtoto.drawImage(misc, 500, 500, 200, 200, 0, 0, 200, 200);
        } else {
            misc.onload = () => { // misc画像が遅れてロードされた場合
                ctxtoto.drawImage(misc, 500, 500, 200, 200, 0, 0, 200, 200);
            };
        }
        PopAnim(document.getElementById('toto'), 5000, 0);
        AboutMove();
        CallforMove();
        AchiveFolder();
    }
}


// ★★★ 変更点: NowaDayNews 関数の引数と内容を更新 ★★★
function NowaDayNews(DMNum, exhibitionsData) {
    let nowaday = new Date();
    let foundCurrentNews = false;
    let targetIndex = DMNum - 1; 

    for (let i = 0; i < DMNum; i++) {
        const exhibition = exhibitionsData[i];

        const startDate = new Date(exhibition.startDate);
        const endDate = new Date(exhibition.endDate);

        if (startDate <= nowaday && nowaday <= endDate && exhibition.isNews === true) {
            targetIndex = i;
            foundCurrentNews = true;
            break; 
        }
    }

    if (foundCurrentNews) {
        document.getElementById('news_li_top').scrollTo({
            top: newsCan[targetIndex].offsetTop,
            behavior: 'smooth'
        });
    } else {
        document.getElementById('news_li_top').scrollTo({
            top: newsCan[targetIndex].offsetTop, 
            behavior: 'smooth'
        });
    }
}

const about_container = document.getElementById('about_container');
const about_contents = document.getElementById('about_contents');
const about_contents1 = document.getElementById('about_contents1');
const about_contents2 = document.getElementById('about_contents2');

function AboutMove() {
    if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) && window.orientation === 0) {

        about.insertAdjacentHTML("afterbegin", `<canvas id="img1" class="img" width="400px" height="225px" style=";position:relative; top: 25px;  margin: auto; z-index:1;"></canvas>`);
        about.insertAdjacentHTML("beforeend", `<canvas id="img2" class="hopper" width="200px" height="112px" style="position:relative; top: -140px;left: -80px; margin: auto; z-index:1; visibility: hidden;"></canvas>`);
        about.insertAdjacentHTML("beforeend", `<canvas id="img3" class="hopper" width="200px" height="112px" style="position:relative; top: -260px;left: 150px; margin: auto;z-index: 0;visibility: hidden;"></canvas>`);
        about.style.height = "1000px";
        about_container.style.width = "450px";
        about_container.style.height = "550px";
        about_container.style.left = "0px";
        about_container.style.top = "10px";
        about_container.style.padding = "100px 0 100px 0";
        about_contents.style.left = "0px";
        about_contents.style.top = "0px";
        about_contents.style.width = "450px";
        about_contents1.style.float = "none";
    } else {
        about.insertAdjacentHTML("afterbegin", `<canvas id="img1" class="img" width="400px" height="225px" style=";position:relative; top: -140px; left: -200px; margin: auto; z-index:1;"></canvas>`);
        about.insertAdjacentHTML("beforeend", `<canvas id="img2" class="hopper" width="200px" height="112px" style="position:relative; top: -400px;left: 450px; margin: auto; z-index:1; visibility: hidden;"></canvas>`);
        about.insertAdjacentHTML("beforeend", `<canvas id="img3" class="hopper" width="200px" height="112px" style="position:relative; top: -320px;left: 80px; margin: auto;z-index: 0;visibility: hidden;"></canvas>`);
    }

    const pic_img1 = document.getElementById('img1');
    const ctximg1 = img1.getContext('2d');
    ctximg1.drawImage(img[1], 0, 0, 400, 225, 0, 0, 400, 225);
    Popimg1(true);

    const img2 = document.getElementById('img2');
    const ctximg2 = img2.getContext('2d');
    ctximg2.drawImage(img[2], 0, 0, 200, 112, 0, 0, 200, 112);

    const img3 = document.getElementById('img3');
    const ctximg3 = img3.getContext('2d');
    ctximg3.drawImage(img[3], 0, 0, 200, 112, 0, 0, 200, 112);
    stopper = false;
}

function Popimg1(pop) {
    if (!pop) {
        img1.animate([{
            opacity: '0.5'
        }, {
            opacity: '1'
        }], 1000);
        img1.style.opacity = `1`;
        return;
    }
    pop = true;
    img1.animate([{
        opacity: '0',
        transform: 'translate(0, 100px)'
    }, {
        offset: 0.1,
        opacity: '0.5'
    }, {
        opacity: '0.5',
        transform: 'translate(0, 0px)'
    }], 1500);
    img1.style.opacity = `0.5`;

}
let totostop = false;

function ToToMove() {
    let totohead;
    let tototitle;
    if (totostop) {
        totohead = document.getElementById('totohead');
        tototitle = document.getElementById('tototitle');
        document.getElementById('toto').style.margin = "0px";
        totohead.style.margin = "0px";
        tototitle.style.margin = "0px";
        totoStopTop = window.innerHeight + window.pageYOffset - 200;
        totoStopLeft = window.innerWidth - 200;
        toto.style.position = 'absolute';
        toto.style.top = `${totoStopTop}px`;
        toto.style.left = `${totoStopLeft}px`;
        tototitle.style.position = 'absolute';
        tototitle.style.top = `${totoStopTop+150}px`;
        tototitle.style.left = `${totoStopLeft-320}px`;
        totohead.style.position = 'absolute';
        totohead.style.top = `${totoStopTop-18}px`;
        totohead.style.left = `${totoStopLeft+46}px`;
        var lastdegree = 0;
        var nowdegree = 30;
        totohead.insertAdjacentHTML("beforebegin",
            `<div id="hitbox" style="position:absolute;width:200px;height:200px;top: ${totoStopTop-128}px;background-color: #80292901;left: ${totoStopLeft-96}px; z-index:4; display:none;"></div>`);


        var hitbox = document.getElementById('hitbox');
        var first = true;
        HoldMoves(totohead, totomouseover);

        function totomouseover() {
            first = true;
            hitbox.style.display = "block";
        };
        HoldMoves(hitbox, totomousemove);

        function totomousemove() {
            var mousePosY;
            mousePosY = event.offsetY;
            if (mousePosY < 130 && first) {
                first = false;
                totohead.animate([{
                    transform: `rotate(${lastdegree}deg)`
                }, {
                    transform: `rotate(${nowdegree}deg)`
                }], {
                    fill: "forwards",
                    duration: 300
                });
            }
            if (mousePosY > 130 && !first) {
                first = true;
                totohead.animate([{
                    transform: `rotate(${nowdegree}deg)`
                }, {
                    transform: `rotate(${lastdegree}deg)`
                }], {
                    fill: "forwards",
                    duration: 300
                });
            }
            if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
                totohead.animate([{
                    transform: `rotate(${lastdegree}deg)`
                }, {
                    transform: `rotate(${nowdegree}deg)`
                }], {
                    fill: "forwards",
                    duration: 300
                }).finished
                    .then(() => totohead.animate([{
                        transform: `rotate(${nowdegree}deg)`
                    }, {
                        transform: `rotate(${lastdegree}deg)`
                    }], {
                        fill: "forwards",
                        duration: 300
                    }));
            }

        };

        hitbox.addEventListener(`mouseleave`, function() {
            hitbox.style.display = "none";
        });

        return;
    }
    toto.style.opacity = `0`;
    var ctxtoto = toto.getContext('2d');
    ctxtoto.clearRect(0, 0, 200, 200);
    toto.style.position = 'fixed';
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    toto.style.top = `${window_height-200}px`;

    toto.style.left = `${window_width-200}px`;

    toto.style.opacity = `1`;
    ctxtoto.drawImage(misc, 300, 500, 200, 200, 0, 0, 200, 200);
    PopAnim(toto, 3000, 0);
    new Promise(function(resolve) {
        resolve();
    }).then(function() {
        setTimeout(function() {
            ctxtoto.clearRect(0, 0, 200, 200);
            ctxtoto.drawImage(misc, 100, 500, 200, 200, 0, 0, 200, 200);

            totobox.insertAdjacentHTML("beforeend", `<canvas id="totohead" width="100px" height="100px" style="position:fixed; margin: auto;top:${window_height-218}px;right: 0px;left: ${window_width-216}px; z-index:3;"></canvas>`);

            totohead = document.getElementById('totohead');
            ctxtotohead = totohead.getContext('2d');
            ctxtotohead.drawImage(misc, 0, 600, 100, 100, 0, 0, 100, 100);
            PopAnim(toto, 3000, 0);
            PopAnim(totohead, 3000, 0);
        }, 1000);
    }).then(function() {
        setTimeout(function() {

            totobox.insertAdjacentHTML("beforeend", `<canvas id="tototitle" width="400px" height="50px" style="position:fixed; margin: auto;top:${window_height-50}px;right: 0px;left: ${window_width-650}px; z-index:3;"></canvas>`);

            tototitle = document.getElementById('tototitle');
            ctxtototitle = tototitle.getContext('2d');
            if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
                ctxtototitle.drawImage(misc, 0, 0, 400, 50, 50, 2, 350, 48);
            } else {
                ctxtototitle.drawImage(misc, 0, 0, 400, 50, 0, 0, 400, 50);
            }

            PopAnim(tototitle, 2000, 0);
        }, 2000);
    });
    window.addEventListener('scroll', () => {

    });
}
const clickYear = new Array();
let testnum = 0;

function AchiveFolder() {
    const exhibitions = window.getExhibitions();
    const DMNum = exhibitions.length;

    if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) && window.orientation === 0) {
        past.insertAdjacentHTML("afterbegin",
            `<div id="achivebox" style="position:relative; background-color:#191a17; margin: auto; width: 450px; height:430px; display:flex; overflow: scroll;flex-wrap: wrap; padding: 0px; align-items: center;"></div>`);
        past.insertAdjacentHTML("afterbegin",
            `<div id="yearmenu" style="position:relative; margin: auto; width: 400px; height:50px; color:#777777;font-size:x-large; z-index: 1;"></div>`);
        document.getElementById(`yearmenu`).insertAdjacentHTML("afterbegin",
            `<div id="yearbox" style="display: flex;justify-content: center;"></div>`);
        past.style.height = "430px";
    } else {
        past.insertAdjacentHTML("afterbegin",
            `<div id="achivebox" style="position:relative; background-color:#191a17; margin: auto; width: 910px; height:430px; display:flex; overflow: scroll;flex-wrap: wrap; padding: 50px; align-items: center;"></div>`);
        past.insertAdjacentHTML("afterbegin",
            `<div id="yearmenu" style="position:absolute; margin: auto; width: 884px; height:50px; padding: 50px; color:#777777;font-size:x-large; z-index: 1;"></div>`);
        document.getElementById(`yearmenu`).insertAdjacentHTML("afterbegin",
            `<div id="yearbox" style="display: flex;justify-content: center;"></div>`);
    }


    const achivebox = document.getElementById('achivebox');
    const uniqueYears = []; // 重複しない年を格納する配列

    // 年のリストを生成
    exhibitions.forEach(exhibition => {
        if (!uniqueYears.includes(exhibition.year)) {
            uniqueYears.push(exhibition.year);
        }
    });
    uniqueYears.sort((a, b) => b - a); // 年を降順にソート

    let currentYearDiv = null;
    let yearIndex = 0;

    for (let i = 0; i < DMNum; i++) {
        const exhibition = exhibitions[i];
        const flipper_i = i; // 0からDMNum-1まで

        // 年の区切りを挿入
        if (yearIndex < uniqueYears.length && exhibition.year === uniqueYears[yearIndex]) {
            const yearDiv = `<div id="${exhibition.year}" class="hopper" style=" margin:10px 50px 0px 50px; width:800px; height:50px; color:#777777;font-size:x-large; text-align: left; visibility: hidden;">${exhibition.year}</div>`;
            achivebox.insertAdjacentHTML("beforeend", yearDiv); // beforebeginからbeforeendに変更して正しい順序に
            document.getElementById(`yearbox`).insertAdjacentHTML("beforeend", // afterbeginからbeforeendに変更
                `<div id="tag${exhibition.year}" class="menu2">${exhibition.year}</div>`);
            yearIndex++;
        }

        // 展示アイテムの挿入
        achivebox.insertAdjacentHTML("beforeend", `<canvas id="flyer${flipper_i}" class="hopper ${exhibition.year}" height="200px" width="200px" style=" margin:4px;visibility: hidden;"></canvas>`);
        calimg[flipper_i] = document.getElementById(`flyer${flipper_i}`);
        ctxcal[flipper_i] = calimg[flipper_i].getContext('2d');
        var caldraw_sp = (200 - cal[flipper_i].width) / 2;
        ctxcal[flipper_i].drawImage(cal[flipper_i], 0, 0, cal[flipper_i].width, cal[flipper_i].height, caldraw_sp, 0, cal[flipper_i].width, cal[flipper_i].height);
        achivebox.insertAdjacentHTML("beforeend", `<div id="achive${flipper_i}" class="hopper ${exhibition.year}"  style=" margin:4px 30px 4px 4px; width:200px; height:300px; color:#777777;font-size:small;visibility: hidden;">
		<p style="background: radial-gradient(#4d2821a3 10%, #0000 60%)">${exhibition.datePeriod}</p>
		<p>${exhibition.name}</p>
		<p>${exhibition.exhibitors.join(', ')}</p>
		<p>${exhibition.comments}</p>
		</div>`);
    }

    // 年タグのクリックイベントを設定
    uniqueYears.forEach(year => {
        const tagElement = document.getElementById(`tag${year}`);
        if (tagElement) {
            tagElement.addEventListener('click', function() {
                const targetYearElement = document.getElementById(year);
                if (targetYearElement) {
                    targetYearElement.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                        inline: "nearest",
                    });
                }
            });
        }
    });

    // スクロールイベントリスナー
    achivebox.addEventListener('scroll', () => {
        for (i = 0; i < hopper.length; i++) {
            if (achivebox.scrollTop > hopper[i].offsetTop - 300 && !hrock[i]) {
                hrock[i] = true;
                PopAnim(hopper[i], 1000, 1);
            }
        }
    });

    menuSet(); // menuSetはここで再度呼び出す
}


function GoScroll(flex_obj, num) {
    document.getElementById(flex_obj).children[num].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
    });
}

const API_KEY = 'AIzaSyBoM6H0NBxC_F0fmvDfCou_ennvi8qnrD0'; // あなたのGoogle Calendar APIキー
const CALENDAR_ID = 'gallerysevenhalfway@gmail.com';
let startDates = new Array();
let endDates = new Array();
let items = new Array();
let Gdateform = /(\d+)-0*(\d+)-0*(\d+)/;

function generate_year_range(start, end) {
    var years = "";
    for (var year = start; year <= end; year++) {
        years += "<option value='" + year + "'>" + year + "</option>";
    }
    return years;
}
var today = new Date();
var currentMonth = today.getMonth();
var currentYear = today.getFullYear();
var selectYear = document.getElementById("year");
var selectMonth = document.getElementById("month");

var createYear = generate_year_range(1970, 2200);

document.getElementById("year").innerHTML = createYear;

var Scalendar = document.getElementById("Scalendar");
var lang = Scalendar.getAttribute('data-lang');

var months = ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"];
var days = ["日", "月", "火", "水", "木", "金", "土"];

var dayHeader = "<tr>";
for (day in days) {
    dayHeader += "<th data-days='" + days[day] + "'>" + days[day] + "</th>";
}
dayHeader += "</tr>";

document.getElementById("thead-month").innerHTML = dayHeader;

monthAndYear = document.getElementById("monthAndYear");

function next() {
    currentYear = (currentMonth === 11) ? currentYear + 1 : currentYear;
    currentMonth = (currentMonth + 1) % 12;
    showCalendar(currentMonth, currentYear);
}

function previous() {
    currentYear = (currentMonth === 0) ? currentYear - 1 : currentYear;
    currentMonth = (currentMonth === 0) ? 11 : currentMonth - 1;
    showCalendar(currentMonth, currentYear);
}

function jump() {
    currentYear = parseInt(selectYear.value);
    currentMonth = parseInt(selectMonth.value);
    showCalendar(currentMonth, currentYear);
}
const url_mouse_event = `onmouseover='this.style.color="#919cd9"'onmouseout='this.style.color="#5763a6"'`;

function showCalendar(month, year) {

    var firstDay = (new Date(year, month)).getDay();
    let GformDatesS = new Array();
    let GformDatesE = new Array();

    tbl = document.getElementById("calendar-body");

    tbl.innerHTML = "";

    monthAndYear.innerHTML = months[month] + " " + year;
    selectYear.value = year;
    selectMonth.value = month;

    // creating all cells
    var date = 1;
    for (var i = 0; i < 6; i++) {
        var row = document.createElement("tr");

        for (var j = 0; j < 7; j++) {
            if (i === 0 && j < firstDay) {
                cell = document.createElement("td");
                cellText = document.createTextNode("");
                cell.appendChild(cellText);
                row.appendChild(cell);
            } else if (date > daysInMonth(month, year)) {
                break;
            } else {
                cell = document.createElement("td");
                cell.setAttribute("data-date", date);
                cell.setAttribute("data-month", month + 1);
                cell.setAttribute("data-year", year);
                cell.setAttribute("data-month_name", months[month]);
                cell.className = "date-picker";

                cell.innerHTML = "<span>" + date + "</span>";
                if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                    cell.className = "date-picker selected";
                }

                for (let k = 0; k < startDates.length; k++) {
                    GformDatesS = startDates[k].match(Gdateform);
                    GformDatesE = endDates[k].match(Gdateform);
                    if (year == GformDatesS[1] && year == GformDatesE[1] && month + 1 == GformDatesS[2] && date == GformDatesS[3] ||
                        year == GformDatesS[1] && year == GformDatesE[1] && month + 1 == GformDatesE[2] && date == GformDatesE[3] ||
                        GformDatesS[1] < GformDatesE[1] && GformDatesS[1] == year && GformDatesS[2] <= month + 1 && GformDatesS[3] < date ||
                        GformDatesS[1] < GformDatesE[1] && GformDatesS[1] == year && month + 1 <= GformDatesE[2] && date < GformDatesE[3] ||
                        GformDatesS[1] == GformDatesE[1] && GformDatesS[1] == year && GformDatesS[2] == month + 1 && month + 1 == GformDatesE[2] && GformDatesS[3] < date && date < GformDatesE[3] ||
                        GformDatesS[1] == GformDatesE[1] && GformDatesS[1] == year && GformDatesS[2] < GformDatesE[2] && GformDatesS[2] == month + 1 && GformDatesS[3] < date ||
                        GformDatesS[1] == GformDatesE[1] && GformDatesS[1] == year && GformDatesS[2] < GformDatesE[2] && GformDatesS[2] < month + 1 && GformDatesE[2] > month + 1 ||
                        GformDatesS[1] == GformDatesE[1] && GformDatesS[1] == year && GformDatesS[2] < GformDatesE[2] && GformDatesE[2] == month + 1 && date < GformDatesE[3]
                    ) {
                        cell.className = "reserved";
                        cell.title = `${items[k].summary}`;
                        if (date === today.getDate() && year === today.getFullYear() && month === today.getMonth()) {
                            cell.className = "reserved selected";
                        }
                    }
                }
                let urldate = date;
                let urlmonth = month + 1;
                if (urlmonth < 10) {
                    urlmonth = "0" + urlmonth;
                }
                if (date < 10) {
                    urldate = "0" + date;
                }
                if (cell.className == "date-picker") {
                    let GculURL = "https://docs.google.com/forms/d/e/1FAIpQLSf7TfudivAz1PpLR1xiSO0zu3WEHSH_oeHXRGgMbMNr39qAtg/viewform?usp=pp_url&entry.1552810174=" + `${year}-${urlmonth}-${urldate}`;
                    cell.innerHTML = `<span>` + `<a href="${GculURL}" target=”_blank ${url_mouse_event} style="text-decoration: none; color:#5763a6;">` + date + "</a>" + "</span>";
                }
                row.appendChild(cell);
                date++;

            }
        }
        ReservedCheker();
        tbl.appendChild(row);
    }

}

function daysInMonth(iMonth, iYear) {
    return 32 - new Date(iYear, iMonth, 32).getDate();
}

function ReservedCheker() {
    const selected = document.getElementsByClassName('selected');
    const reserved = document.getElementsByClassName('reserved');
    const reserve_tips = document.getElementById('reserve_tips');
    let mc = 0;
    let reserved_color = "#886655";
    let reserved_bcolor = "#9726";
    let reserved_bcolors = [933, 386, 648, 500, 050, 005, 770, 077, 707];
    let selected_bcolor = "#7214";
    let i = 0;
    let jpS_dates = new Array();
    let jpE_dates = new Array();

    while (mc < reserved.length) {
        reserved[mc].style.textDecoration = "none";
        reserved[mc].style.color = reserved_color;
        if (mc > 0) {
            if (reserved[mc].title != reserved[mc - 1].title) {
                if (i > 8) {
                    reserved_bcolors.push(Math.floor(Math.random() * 1000));
                }
                reserved_bcolor = `#${reserved_bcolors[i]}4`;
                i++;
            }
        }
        reserved[mc].style.backgroundColor = reserved_bcolor;
        ReservePop(mc);
        mc++;
    }
    if (selected.length == 1) {
        selected[0].style.backgroundColor = selected_bcolor;
    }

    function ReservePop(j) {
        reserved[j].addEventListener(`${pointstart}`, function() {
            event.preventDefault();
            for (i = 0; i < items.length; i++) {
                jpS_dates[i] = startDates[i];
                jpE_dates[i] = endDates[i];
                if (reserved[j].title == items[i].summary) {
                    jpS_dates[i] = jpS_dates[i].replace(/\d+-(\d+)-(\d+)/g, `$1月$2日～`);
                    jpE_dates[i] = jpE_dates[i].replace(/\d+-(\d+)-(\d+)/g, `$1月$2日`);
                    reserve_tips.innerHTML = "<p>" + items[i].summary + "</p>" + "<p>" + jpS_dates[i] + jpE_dates[i] + "</p>";
                    reserve_tips.style.visibility = "visible";
                }
            }

        });
    }
}

function Gcalender() {
    gapi.client.init({
        'apiKey': API_KEY,
    }).then(function() {
        return gapi.client.request({
            'path': 'https://www.googleapis.com/calendar/v3/calendars/' + encodeURIComponent(CALENDAR_ID) + '/events'
        });
    }).then(function(response) {
        items = response.result.items;

        for (let i = 0; i < items.length; i++) {
            startDates[i] = items[i].start.dateTime;
            endDates[i] = items[i].end.dateTime;
            if (items[i].start.dateTime === undefined) {
                startDates[i] = items[i].start.date;
                startDates[i] = startDates[i].replace(/(\d+)-(\d+)\D(\d+)/g, `$1-$2-$3`);
                endDates[i] = items[i].start.date;
                endDates[i] = endDates[i].replace(/(\d+)-(\d+)\D(\d+)/g, `$1-$2-$3`);
                continue;
            }
            startDates[i] = startDates[i].replace(/(\d+)-(\d+)\D(\d+)\D\d+\D\d+\D\d+\D\d+\D\d+/g, `$1-$2-$3`);
            endDates[i] = endDates[i].replace(/(\d+)-(\d+)\D(\d+)\D\d+\D\d+\D\d+\D\d+\D\d+/g, `$1-$2-$3`);
        }
        showCalendar(currentMonth, currentYear);
    }, function(reason) {
        console.log('Error: ' + reason.result.error.message);
    });
}


function CallforMove() {
    const callfor_text1 = document.getElementById("callfor_text1");
    const callfor_container = document.getElementById("callfor_container");
    if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i) && window.orientation === 0) {

        callfor_text1.insertAdjacentHTML("beforeend",
            `<div id="spaceimgbox"  style="position:relative;width:300px;height:200px;top: 0px;left: 0px;background-color: #80292901; margin: auto; z-index:1;"></div>`);
        callfor_container.style.width = "400px";
        callfor.style.width = "450px";
    } else {
        callfor_text1.insertAdjacentHTML("beforeend",
            `<div id="spaceimgbox"  style="position:absolute;width:300px;height:200px;top: 0px;left: 500px;background-color: #80292901; margin: auto; z-index:1;"></div>`);
    }
    var spaceimgbox = document.getElementById("spaceimgbox");
    spaceimgbox.insertAdjacentHTML("beforeend",
        `<canvas id="spaceimg" class="hopper" height="200px" width="300px" style="position:absolute;width:300px;height:200px;top: 0px;left: 0px;background-color: #80292901; visibility: hidden;"></canvas>`);
    const spaceimg = document.getElementById("spaceimg");
    const ctxspaceimg = spaceimg.getContext('2d');
    ctxspaceimg.drawImage(misc, 0, 100, 300, 200, 0, 0, 300, 200);
    const smallspace = document.getElementById("smallspace");
    const bigspace = document.getElementById("bigspace");
    spaceimg.insertAdjacentHTML("afterend",
        `<div id="Bspace_erea" style="position:absolute;width:135px;height:176px;top: 10px;left: 9px; background-color: #a4323282; display: none;"><div style="position:absolute;width:48px;height:56px;top:120px;left: 135px; background-color: #a4323282; z-index:1;"></div></div>`);
    spaceimg.insertAdjacentHTML("afterend",
        `<div id="Sspace_erea" style="position:absolute;width:98px;height:56px;top: 130px;left: 192px; background-color: #a4323282; visibility: hidden;"></div>`);
    const Bspace_erea = document.getElementById("Bspace_erea");
    const Sspace_erea = document.getElementById("Sspace_erea");
    bigspace.addEventListener(`${pointend}`, bigspaceoff);

    function bigspaceoff(event) {
        event.preventDefault();
        Bspace_erea.style.display = "none";
    }
    smallspace.addEventListener(`${pointstart}`, smallspaceon);

    function smallspaceon(event) {
        event.preventDefault();
        Sspace_erea.style.visibility = "visible";
    }
    smallspace.addEventListener(`${pointend}`, smallspaceoff);

    function smallspaceoff(event) {
        event.preventDefault();
        Sspace_erea.style.visibility = "hidden";
    }
    bigspace.addEventListener(`${pointstart}`, bigspaceon);

    function bigspaceon(event) {
        event.preventDefault();
        Bspace_erea.style.display = "block";
    }
}

var endX;
var starX;

function NewsZoomer() {
    var clicklocker = false;
    newsCan.forEach(function(target) {
        if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
            long_press(target, PopNewsViewer, SampleShown);

            function SampleShown() {
                newszoombox.style.visibility = "visible";
                newszoombox.style.scale = "40%";
                var target_num = target.id.replace(/news(\d+)/g, `$1`);
                document.getElementById("newszoomflex").children[target_num].scrollIntoView({ // target_numは0ベース
                    behavior: "smooth",
                    block: "nearest",
                    inline: "nearest",
                });
            }
        } else {
            target.addEventListener(`${pointstart}`, function() {
                newszoombox.style.visibility = "visible";
                newszoombox.style.scale = "40%";
                var target_num = target.id.replace(/news(\d+)/g, `$1`);
                document.getElementById("newszoomflex").children[target_num].scrollIntoView({ // target_numは0ベース
                    behavior: "smooth",
                    block: "nearest",
                    inline: "nearest",
                });
            });
        }

        target.addEventListener(`${pointend}`, function() {
            if (!clicklocker) {
                newszoombox.style.visibility = "hidden";
                newszoombox.style.scale = "100%";
            }

        });
        target.addEventListener('click', PopNewsViewer);

        function PopNewsViewer() {
            newszoombox.style.visibility = "visible";
            newszoombox.style.scale = "100%";
            var target_num = target.id.replace(/news(\d+)/g, `$1`);
            document.getElementById("newszoomflex").children[target_num].scrollIntoView({ // target_numは0ベース
                behavior: "smooth",
                block: "nearest",
                inline: "nearest",
            });
            clicklocker = true;
        }
    });

    document.getElementById("home").addEventListener('click', (e) => {
        if (!e.target.closest('#newszoombox')) {
            newszoombox.style.visibility = "hidden";
            clicklocker = false;
        }
    });
    document.getElementById("about").addEventListener('click', (e) => {
        if (!e.target.closest('#newszoombox')) {
            newszoombox.style.visibility = "hidden";
            clicklocker = false;
        }
    });

    const newsturnright = document.getElementsByClassName(`newsturnright`);
    const newsturnleft = document.getElementsByClassName(`newsturnleft`);
    const roll_target = ["newsflex", "newszoomflex"];
    for (i = 0; i < newsturnright.length; i++) {
        Eachturn(i, roll_target[i]);
    }

    function Eachturn(i, flex_obj) {
        newsturnright[i].addEventListener(`${pointstart}`, function() {
            newsturnright[i].style.backgroundColor = "rgba(100,100,100,0.3)";
            TurnRight(true, `${flex_obj}`);
        });
        newsturnright[i].addEventListener(`${pointend}`, function() {
            newsturnright[i].style.backgroundColor = "rgba(1,1,1,0)";
        });
        newsturnleft[i].addEventListener(`${pointstart}`, function() {
            TurnRight(false, `${flex_obj}`);
            newsturnleft[i].style.backgroundColor = "rgba(100,100,100,0.3)";
        });
        newsturnleft[i].addEventListener(`${pointend}`, function() {
            newsturnleft[i].style.backgroundColor = "rgba(1,1,1,0)";
        });
        document.getElementById(`${flex_obj}`).addEventListener(`touchstart`, function(event) {
            event.preventDefault();
            starX = event.touches[0].pageX;
        });
        document.getElementById(`${flex_obj}`).addEventListener(`touchmove`, function(event) {
            event.preventDefault();
            endX = event.touches[0].pageX;
        });
        document.getElementById(`${flex_obj}`).addEventListener(`touchend`, function(event) {
            event.preventDefault();
            if (0 < endX - starX) {
                TurnRight(false, `${flex_obj}`);
            } else {
                TurnRight(true, `${flex_obj}`);
            }
        });
    }
}
let turn_right = true;
let num = 0;
let turnAroundBlocker = false;

function TurnRight(turn_right, flex_obj) {
    var turn_element = document.getElementById(flex_obj);
    if (!turnAroundBlocker) {
        if (turn_right) {
            if (num + 1 < turn_element.children.length) {
                num++;
            } else {
                return;
            }
        } else {
            if (num - 1 >= 0) {
                num--;
            } else {
                return;
            }
        }
    }

    var child = turn_element.children[num];
    child.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
    });
    turnAroundBlocker = false;
}

let doc;
let pop = true;
let pop_direction = 0;

function PopAnim(doc, AnimTime, pop_direction) {

    if (doc.style.display == 'none') {
        doc.style.display = 'block';
    }
    if (doc.style.visibility == 'hidden') {
        doc.style.visibility = 'visible';
    }

    if (pop_direction == 0) {
        doc.animate([{
            opacity: '0',
            transform: 'translate(0, 0px)'
        }, {
            offset: 0.1,
            opacity: '0.1'
        }, {
            opacity: '1',
            transform: 'translate(0, 0px)'
        }], AnimTime);
    }
    if (pop_direction == 1) {
        doc.animate([{
            opacity: '0',
            transform: 'translate(0, 100px)'
        }, {
            offset: 0.1,
            opacity: '0.1'
        }, {
            opacity: '1',
            transform: 'translate(0, 0px)'
        }], AnimTime);
    }
    if (pop_direction == 2) {
        doc.animate([{
            opacity: '0',
            transform: 'translate(-100px, 0px)'
        }, {
            offset: 0.1,
            opacity: '0.1'
        }, {
            opacity: '1',
            transform: 'translate(0, 0px)'
        }], AnimTime);
    }
    if (pop_direction == 3) {
        doc.animate([{
            opacity: '0',
            transform: 'translate(0px, -100px)'
        }, {
            offset: 0.1,
            opacity: '0.1'
        }, {
            opacity: '1',
            transform: 'translate(0, 0px)'
        }], AnimTime);
    }
    if (pop_direction == 4) {
        doc.animate([{
            opacity: '0',
            transform: 'translate(100px, 0px)'
        }, {
            offset: 0.1,
            opacity: '0.1'
        }, {
            opacity: '1',
            transform: 'translate(0, 0px)'
        }], AnimTime);
    }
}

function HeaderPops() {
    if (ScrollUpnow) {
        header.animate([{
            opacity: '1',
            transform: 'translate(0, 0)'
        }, {
            offset: 0.9,
            opacity: '0.1'
        }, {
            opacity: '0',
            transform: 'translate(0, -100px)'
        }], 100).finished
            .then(() => header.style.display = 'none');
    }
    if (ontop) {
        return;
    }
    if (Scrollnow) {
        header.style.display = 'block';
        header.animate([{
            opacity: '0',
            transform: 'translate(0, -100px)'
        }, {
            offset: 0.1,
            opacity: '0.1'
        }, {
            opacity: '1',
            transform: 'translate(0, 0px)'
        }], 100);
    }
}

let set_position = 0;
let Scrollnow = false;
let ScrollUpnow = false;
let ontop = true;
const section = document.getElementsByTagName('section');
let sectionNum = 0;
var hopper = document.getElementsByClassName('hopper');
const hrock = new Array(hopper.length).fill(false); // 初期化
var container = document.getElementsByClassName('container');
let controck = new Array(container.length).fill(false); // 初期化
let img1rock = false;
let stopper = true;
window.addEventListener('scroll', () => {
    const scrollBottom = window.pageYOffset + window.innerHeight;
    if (stopper) {
        return;
    }

    // sectionの処理
    for (let i = 0; i < section.length; i++) {
        if (section[i].offsetTop && scrollBottom > section[i].offsetTop + section[i].offsetHeight && sectionNum <= i) { // section[i].offsetTopの存在チェックを追加
            sectionNum++;
            if (i === 5) { // teamセクションのインデックスが5の場合
                totostop = true;
                ToToMove();
            }
            // 他のセクションに関する処理があればここに追加
        }
    }

    // hopper要素の処理
    for (let i = 0; i < hopper.length; i++) {
        if (hopper[i].getBoundingClientRect().top + window.pageYOffset < scrollBottom && !hrock[i]) { // 画面内に入ったかどうかの判定
            hrock[i] = true;
            PopAnim(hopper[i], 1000, 1);
        }
    }

    // container要素の処理
    for (let i = 0; i < container.length; i++) {
        if (scrollBottom > 700 && !controck[i]) {
            PopAnim(container[i], 500, 2);
            controck[i] = true;
        }
    }

    // img1の処理
    const img1Element = document.getElementById('img1');
    if (img1Element && scrollBottom > img1Element.getBoundingClientRect().top + window.pageYOffset && !img1rock) {
        img1rock = true;
        Popimg1(false);
    }


    if (document.documentElement.scrollTop < 500 && !ontop) {
        ontop = true;
    }
    if (document.documentElement.scrollTop >= 500 && ontop) {
        ontop = false;
    }

    if (ScrollUpnow) {
        if (Scrollnow) {
            return;
        }
        if (set_position <= document.documentElement.scrollTop - 5) {
            HeaderPops();
            Scrollnow = true;
            ScrollUpnow = false;
        }
        set_position = document.documentElement.scrollTop;
        return;
    }
    if (set_position > document.documentElement.scrollTop) {
        HeaderPops();
        ScrollUpnow = true;
        Scrollnow = false;
    }
    set_position = document.documentElement.scrollTop;

});

if (navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)) {
    window.addEventListener("orientationchange", function() {
        if (window.orientation === 0) {
            gallery_map.style.width = "450px";
            contact.style.width = "450px";
            team.style.width = "450px";
            team.style.height = "1700px";
            team_container.style.height = "1500px";
            gallery.style.width = "450px";
            footer.style.width = "450px";
            header.style.width = "450px";
            document.getElementById('calendar_container').style.left = "-80px";
            document.getElementById('toproom').style.width = "450px";
            document.getElementById('newsflexbox').style.left = "0px";
            document.getElementById('newszoombox').style.width = "400px";
            document.getElementById('newszoomflex').style.width = "400px";
            const DMNum = window.getExhibitions().length; // DMNumを取得
            for (let i = 0; i < DMNum; i++) { // NewsNumではなくDMNumを使用
                document.getElementById(`newszoombox${i}`).style.width = "400px";
                document.getElementById(`newszooms${i}`).style.width = `${zooms[i].width/2}px`;
                document.getElementById(`newszooms${i}`).style.height = `${zooms[i].height/2}px`;
                if (zooms[i].height == 800) {
                    document.getElementById(`newszooms${i}`).style.width = `${zooms[i].width*0.7/2}px`;
                    document.getElementById(`newszooms${i}`).style.height = `${zooms[i].height*0.7/2}px`;
                }
            }
            about.style.height = "1000px";
            about_container.style.width = "450px";
            about_container.style.height = "550px";
            about_container.style.left = "0px";
            about_container.style.top = "10px";
            about_container.style.padding = "100px 0 100px 0";
            about_contents.style.left = "0px";
            about_contents.style.top = "0px";
            about_contents.style.width = "450px";
            about_contents1.style.float = "none";
            document.getElementById('img3').style.top = "-260px";
            document.getElementById('img3').style.left = "150px";
            document.getElementById('img2').style.top = "-140px";
            document.getElementById('img2').style.left = "-80px";
            document.getElementById('img1').style.top = "25px";
            document.getElementById('img1').style.left = null;
            document.getElementById('achivebox').style.width = "450px";
            document.getElementById('achivebox').style.padding = "0px";
            document.getElementById('yearmenu').style.position = "relative";
            document.getElementById('yearmenu').style.padding = "0";
            document.getElementById('yearmenu').style.width = "400px";
            past.style.height = "430px";
            callfor_container.style.width = "400px";
            callfor.style.width = "450px";
            document.getElementById('spaceimgbox').style.position = "relative";
            document.getElementById('spaceimgbox').style.left = "0px";
        } else {
            gallery_map.style.width = "785px";
            contact.style.width = "984px";
            team.style.width = "984px";
            team.style.height = "984px";
            team_container.style.height = "500px";
            gallery.style.width = "984px";
            footer.style.width = "984px";
            header.style.width = "100%";
            document.getElementById('calendar_container').style.left = "0px";
            document.getElementById('toproom').style.width = "800px";
            document.getElementById('newsflexbox').style.left = "450px";
            document.getElementById('newszoombox').style.width = "850px";
            document.getElementById('newszoomflex').style.width = "850px";
            const DMNum = window.getExhibitions().length; // DMNumを取得
            for (let i = 0; i < DMNum; i++) { // NewsNumではなくDMNumを使用
                document.getElementById(`newszoombox${i}`).style.width = "850px";
                document.getElementById(`newszooms${i}`).style.width = `${zooms[i].width}px`;
                document.getElementById(`newszooms${i}`).style.height = `${zooms[i].height}px`;
                if (zooms[i].height == 800) {
                    document.getElementById(`newszooms${i}`).style.width = `${zooms[i].width*0.7}px`;
                    document.getElementById(`newszooms${i}`).style.height = `${zooms[i].height*0.7}px`;
                }
            }
            about.style.height = "500px";
            about_container.style.width = "820px";
            about_container.style.height = "300px";
            about_container.style.left = "-250px";
            about_container.style.top = "-200px";
            about_container.style.padding = "100px";
            about_contents.style.left = "230px";
            about_contents.style.top = "30px";
            about_contents.style.width = "760px";
            about_contents1.style.float = "left";
            document.getElementById('img3').style.top = "-320px";
            document.getElementById('img3').style.left = "80px";
            document.getElementById('img2').style.top = "-400px";
            document.getElementById('img2').style.left = "450px";
            document.getElementById('img1').style.top = "-140px";
            document.getElementById('img1').style.left = "-200px";
            document.getElementById('achivebox').style.width = "884px";
            document.getElementById('achivebox').style.padding = "50px";
            document.getElementById('yearmenu').style.position = "absolute";
            document.getElementById('yearmenu').style.padding = "50px";
            document.getElementById('yearmenu').style.width = "884px";
            past.style.height = "600px";
            callfor_container.style.width = "740px";
            callfor.style.width = "984px";
            document.getElementById('spaceimgbox').style.position = "absolute";
            document.getElementById('spaceimgbox').style.left = "500px";
        }
    });
}

const menu = document.getElementsByClassName('menu');
const menu2 = document.getElementsByClassName('menu2');
const flex = document.getElementsByClassName('flex');
const linkcolor = "#a1b9cc";
const linkcolor2 = "#2b617b";

function menuSet() {

    var mc = 0;

    while (mc < menu.length) {
        menu[mc].style.fontSize = "large";
        menu[mc].style.textDecoration = "none";
        menu[mc].style.marginTop = "3%";
        menu[mc].style.marginLeft = "1%";
        menu[mc].style.marginRight = "1%";
        menu[mc].style.color = linkcolor;
        mc++;
    }
    mc = 0;
    while (mc < menu2.length) {
        menu2[mc].style.fontSize = "large";
        menu2[mc].style.textDecoration = "none";
        menu2[mc].style.marginTop = "3%";
        menu2[mc].style.marginLeft = "1%";
        menu2[mc].style.marginRight = "1%";
        menu2[mc].style.color = linkcolor2;
        mc++;
    }
    mc = 0;
    while (mc < flex.length) {
        flex[mc].style.display = "flex";
        flex[mc].style.flexWrap = "wrap";
        flex[mc].style.justifyContent = "center";
        flex[mc].style.overflow = "hidden";
        mc++;
    }
    mc = 0;
    while (mc < hopper.length) {
        hopper[mc].style.visibility = "hidden";
        mc++;
    }
    var triggers = Array.from(menu);
    triggers.forEach(function(target) {
        target.addEventListener(`${pointstart}`, function() {
            target.style.color = "#e1f2ff";
        });
        target.addEventListener(`${pointend}`, function() {
            target.style.color = linkcolor;
        });
    });
    var triggers2 = Array.from(menu2);
    triggers2.forEach(function(target) {
        target.addEventListener(`${pointstart}`, function() {
            target.style.color = "#7aa6cc";
        });
        target.addEventListener(`${pointend}`, function() {
            target.style.color = linkcolor2;
        });
    });
}


function long_press(target_element, normal_func, long_func) {
    let longclick = false;
    let longtap = false;
    let touch = false;
    let touchmovelock = false;
    let sec = 1000;
    let timer;
    let movetimer;
    target_element.addEventListener('touchstart', (event) => {
        event.preventDefault();
        touchmovelock = false;
        touch = true;
        longtap = false;
        timer = setTimeout(() => {
            longtap = true;
            long_func();
        }, sec);
    });
    target_element.addEventListener('touchend', () => {
        if (!longtap) {
            clearTimeout(timer);
            clearTimeout(movetimer);
            if (!touchmovelock) {
                normal_func();
            }
        } else {
            touch = false;
        }
    });
    target_element.addEventListener('touchmove', () => {
        movetimer = setTimeout(() => {
            touchmovelock = true;
        }, 50);
    });
    target_element.addEventListener('mousedown', () => {
        if (touch) return;
        longclick = false;
        timer = setTimeout(() => {
            longclick = true;
            long_func();
        }, sec);
    });
    target_element.addEventListener('click', () => {
        if (touch) {
            touch = false;
            return;
        }
        if (!longclick) {
            clearTimeout(timer);
        }
    });
}

function HoldMoves(target_element, touchmove_func) {
    let longclick = false;
    let longtap = false;
    let touch = false;
    let sec = 50;
    let timer;
    target_element.addEventListener('touchstart', () => {
        touch = true;
        longtap = false;
        timer = setTimeout(() => {
            longtap = true;
        }, sec);
    });
    target_element.addEventListener('touchend', () => {
        if (!longtap) {
            clearTimeout(timer);
        } else {
            touch = false;
        }
    });
    target_element.addEventListener('touchmove', (event) => {
        event.preventDefault();
        touchmove_func();
    });
    target_element.addEventListener('mouseover', () => {
        touchmove_func();
    });
    target_element.addEventListener('mousemove', () => {
        touchmove_func();
    });
}