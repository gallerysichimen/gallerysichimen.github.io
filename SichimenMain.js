const ImgsNum = 3;

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

// cal, img, news, zooms, newsCan, ctxnews, newszoomCan, ctxnewszoom, calimg, ctxcal
// これらは動的に生成されるため、初期化はそのまま
const cal = new Array(); // cal画像（Imageオブジェクト）を格納
const img = new Array(); // img要素（HTMLImageElement）を格納
const news = new Array();
const zooms = new Array(); // zoom画像（Imageオブジェクト）を格納
const newsCan = new Array();
const ctxnews = new Array();
const newszoomCan = new Array();
const ctxnewszoom = new Array();
const calimg = new Array(); // ★修正箇所: 単に空の配列として初期化します
const ctxcal = new Array(); // cal用CanvasRenderingContext2Dを格納

let pointstart;
let pointend;
let pointmove;
window.scrollTo(0, 0);

const gallery_map = document.getElementById("gallery_map");
const team_container = document.getElementById('team_container');

// DOMContentLoadedイベントリスナー内でデータロードを待機
window.addEventListener('DOMContentLoaded', () => {
    // data.js からの 'exhibitionsLoaded' イベントをリッスン
    window.addEventListener('exhibitionsLoaded', (event) => {
        const allExhibitions = event.detail.exhibitions;
        const formattedExhibitionDates = event.detail.formattedDates;

        // 画像のプリロード（calとzoom）
        let imagesLoadedCount = 0;
        let actualImagesToLoad = 0; // 実際にsrcが設定される画像のみをカウント

        allExhibitions.forEach((exhibition, index) => {
            // calとzoomsの各要素を必ずImageオブジェクトとして初期化します。
            cal[index] = new Image();
            zooms[index] = new Image();

            // cal画像の読み込み
            if (exhibition.calImage && exhibition.calImage.filename) {
                actualImagesToLoad++; // srcが設定されるのでカウント
                cal[index].src = `../img/cal/${exhibition.calImage.filename}.${exhibition.calImage.extension}`;
                cal[index].onload = () => {
                    imagesLoadedCount++;
                    if (imagesLoadedCount === actualImagesToLoad) {
                        onAllImagesLoaded(allExhibitions, formattedExhibitionDates);
                    }
                };
                cal[index].onerror = () => {
                    console.error(`Failed to load cal image: ${cal[index].src}. This image might not exist.`);
                    imagesLoadedCount++; // エラーでもカウントを進める
                    if (imagesLoadedCount === actualImagesToLoad) {
                        onAllImagesLoaded(allExhibitions, formattedExhibitionDates);
                    }
                };
            } else {
                // calImageデータがない場合、Imageオブジェクトは作成済みだがsrcは未設定
                console.warn(`Skipping cal image loading for exhibition at index ${index} due to missing calImage data.`);
            }

            // zoom画像の読み込みも同様に
            if (exhibition.zoomImage && exhibition.zoomImage.filename) {
                actualImagesToLoad++; // srcが設定されるのでカウント
                zooms[index].src = `../img/zoom/${exhibition.zoomImage.filename}.${exhibition.zoomImage.extension}`;
                zooms[index].onload = () => {
                    imagesLoadedCount++;
                    if (imagesLoadedCount === actualImagesToLoad) {
                        onAllImagesLoaded(allExhibitions, formattedExhibitionDates);
                    }
                };
                zooms[index].onerror = () => {
                    console.error(`Failed to load zoom image: ${zooms[index].src}. This image might not exist.`);
                    imagesLoadedCount++;
                    if (imagesLoadedCount === actualImagesToLoad) {
                        onAllImagesLoaded(allExhibitions, formattedExhibitionDates);
                    }
                };
            } else {
                // zoomImageデータがない場合、Imageオブジェクトは作成済みだがsrcは未設定
                console.warn(`Skipping zoom image loading for exhibition at index ${index} due to missing zoomImage data.`);
            }
        });

        // 実際にロードを試みる画像が一つもない場合の対応
        if (actualImagesToLoad === 0) {
            onAllImagesLoaded(allExhibitions, formattedExhibitionDates);
        }
    });

    // その他の初期化処理 (変更なし)
    if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
        gallery_map.style.width="450px";
        contact.style.width="450px";
        team.style.width="450px";
        team.style.height="1700px";
        team_container.style.height="1500px";
        callfor.style.paddingBottom="200px";
        gallery.style.width="450px";
        footer.style.width="450px";
        header.style.width="450px";
    }
    menuSet();
    misc = new Image();
    misc.src=`../img/misc.png`;
    misc.onload = function (){
        ctxtitle.drawImage(misc, 0, 0, 400, 50, 0, 0, 400, 50);
    };
});

function onAllImagesLoaded(allExhibitions, formattedExhibitionDates) {
    // DMNumをallExhibitionsの長さで設定
    const DMNum = allExhibitions.length;
    
    // AchiveFolderを呼び出す
    AchiveFolder(allExhibitions);
    
    // RoomPreparなど、calやzooms配列に依存する関数をここで呼び出す
    RoomPrepar(allExhibitions, formattedExhibitionDates);
    gapi.load('client', Gcalender);
}

// pointstart, pointend, pointmove の定義 (変更なし)
if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
	pointstart = `touchstart`;
	pointend = `touchend`;
	pointmove = `touchmove`;
}
else{
	pointstart ="mouseover";
	pointend = "mouseleave";
	pointmove = "mousemove";
}

// AchiveFolder 関数
function AchiveFolder(exhibitions){
	if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
		gallery.insertAdjacentHTML("afterbegin", `<div id="achive_folder_box" style="position:absolute; margin: auto; top: 0px;right: 0;bottom: 0;left: 0;"></div>`);
	}
	else{
		gallery.insertAdjacentHTML("afterbegin", `<div id="achive_folder_box" style="position:absolute; margin: auto; top: 0px;right: 0;bottom: 0;left: 0;"></div>`);
	}
	var achiveFolderBox = document.getElementById('achive_folder_box');
	
	var i = 0;
	// ギャラリーの各アイテムを生成 (最新の展示が先頭に来るようにリバース)
	// exhibitorsは全て文字列の配列として扱われるようにする
	exhibitions.slice().reverse().forEach((exhibition, index) => { // slice().reverse() で元の配列を破壊せずに逆順に
        const originalIndex = exhibitions.length - 1 - index; // 元の配列のインデックスを計算

		var achiveinbox = `<div id="achiveinbox${i+1}" style="display:flex; margin: 10px auto; width: 800px; height: 200px; background-color: #241f17;"></div>`;
		if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
			achiveinbox = `<div id="achiveinbox${i+1}" style="display:block; margin: 10px auto; width: 400px; height: 400px; background-color: #241f17;"></div>`;
		}
		achiveFolderBox.insertAdjacentHTML("beforeend", achiveinbox);
		var inbox = document.getElementById(`achiveinbox${i+1}`);
		
        // cal画像が有効なImageオブジェクトであることを確認
        if (cal[originalIndex] && cal[originalIndex].width > 0 && cal[originalIndex].height > 0) {
            inboxCan = `<div id="achiveimgbox${i+1}" style="width: 250px;height:200px; margin: 1%;"><canvas id="cal${i+1}" width="${cal[originalIndex].width}px" height="${cal[originalIndex].height}px" style=" margin: 10px 0 0 10px;"></canvas></div>`;
            if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
                inboxCan = `<div id="achiveimgbox${i+1}" style="width: 250px;height:200px; margin: 1%;"><canvas id="cal${i+1}" width="${cal[originalIndex].width*0.7}px" height="${cal[originalIndex].height*0.7}px" style=" margin: 10px 0 0 10px;"></canvas></div>`;
            }
            inbox.insertAdjacentHTML("beforeend", inboxCan);
            
            calimg[i+1] = document.getElementById(`cal${i+1}`);
            ctxcal[i+1] = calimg[i+1].getContext('2d');
            
            // 画像の実際のサイズとキャンバスのサイズを考慮して描画
            let drawWidth = cal[originalIndex].width;
            let drawHeight = cal[originalIndex].height;
            let canvasWidth = calimg[i+1].width;
            let canvasHeight = calimg[i+1].height;

            // アスペクト比を維持しつつ、キャンバスに収まるように画像を縮小
            let aspectRatio = drawWidth / drawHeight;
            let canvasAspectRatio = canvasWidth / canvasHeight;

            let finalDrawWidth, finalDrawHeight;
            if (aspectRatio > canvasAspectRatio) {
                finalDrawWidth = canvasWidth;
                finalDrawHeight = canvasWidth / aspectRatio;
            } else {
                finalDrawHeight = canvasHeight;
                finalDrawWidth = canvasHeight * aspectRatio;
            }
            
            // キャンバスの中心に描画するためのオフセット
            let offsetX = (canvasWidth - finalDrawWidth) / 2;
            let offsetY = (canvasHeight - finalDrawHeight) / 2;

            ctxcal[i+1].drawImage(cal[originalIndex], 0, 0, drawWidth, drawHeight, offsetX, offsetY, finalDrawWidth, finalDrawHeight);

        } else {
            console.warn(`Warning: cal image for exhibition '${exhibition.name}' (original index: ${originalIndex}) could not be drawn in AchiveFolder. Image might be missing or failed to load.`);
            inboxCan = `<div id="achiveimgbox${i+1}" style="width: 250px;height:200px; margin: 1%; background-color: #333; color: #eee; text-align: center; line-height: 200px;">画像なし</div>`;
            if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
                inboxCan = `<div id="achiveimgbox${i+1}" style="width: 250px;height:200px; margin: 1%; background-color: #333; color: #eee; text-align: center; line-height: 200px;">画像なし</div>`;
            }
            inbox.insertAdjacentHTML("beforeend", inboxCan);
        }
		
		// exhibits.commentsからexhibition.commentsに変更
		// exhibits.exhibitorからexhibition.exhibitorsに変更
		var achivetexbox = `<div id="achivetexbox${i+1}" style="width: 500px; margin: 0px 0px 0px 20px; color: #988;"><p style="font-size: 20px;margin: 5px 0 0 0;">${exhibition.name}<br><font style="font-size: xx-small;">${exhibition.datePeriod}<br>${exhibition.time}</font></p><p style="font-size: 15px; margin: 0px 0px 0px 0px;">${exhibition.exhibitors.join(', ')}<br>${exhibition.comments}</p></div>`;
		if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
			achivetexbox = `<div id="achivetexbox${i+1}" style="width: 350px; margin: 0px auto; color: #988;"><p style="font-size: 20px;margin: 5px 0 0 0;">${exhibition.name}<br><font style="font-size: xx-small;">${exhibition.datePeriod}<br>${exhibition.time}</font></p><p style="font-size: 15px; margin: 0px 0px 0px 0px;">${exhibition.exhibitors.join(', ')}<br>${exhibition.comments}</p></div>`;
		}
		inbox.insertAdjacentHTML("beforeend", achivetexbox);

		i++;
	});
	PopAnim(document.getElementById('achive_folder_box'),5000,0);
}

// RoomPrepar 関数
function RoomPrepar(exhibitions, formattedDates){
	let inboxCan;
	if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
		home.insertAdjacentHTML("beforebegin", `<div id="toproom" style=" visibility: hidden; position: absolute; background-color: #9b846d; height: 500px;width: 450px;top: 50px; left: 0; right:0; margin: auto; z-index:1;"></div>`);
		let calendar_container = document.getElementById("calendar_container")
		if (calendar_container) {
            calendar_container.style.left="-80px";
        }
	}
	else{
		home.insertAdjacentHTML("beforebegin", `<div id="toproom" style=" visibility: hidden; position: absolute; background-color: #9b846d; height: 500px;width: 800px;top: 50px; left: 0; right:0; margin: auto; z-index:1;"></div>`);
	}
	PopAnim(document.getElementById('toproom'), 5000,0);
	NewsEvent(exhibitions, formattedDates);
}
	
// NewsEvent 関数
function NewsEvent(exhibitions, formattedDates){
	if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
		document.getElementById('toproom').insertAdjacentHTML("afterbegin", `<div id="newsflexbox" style="position:absolute; margin: auto; top: 510px;right: 0;bottom: 0;"></div>`);
		document.getElementById('toproom').insertAdjacentHTML("afterend", 
		`<div id="newszoombox" style="width:400px;height:600px;background-color: #110501df; visibility: hidden; z-index:4; position:absolute; margin: 0px auto 0px auto; top: 100px;left: 0; right: 0;"></div>`);
		document.getElementById('newszoombox').insertAdjacentHTML("afterbegin", 
		`<div id="newszoomflex" style="width:400px;height:600px; gap:800px 800px; display:flex; overflow: hidden; position:absolute; margin: auto;"></div>`);
	}
	else{
		document.getElementById('toproom').insertAdjacentHTML("afterbegin", `<div id="newsflexbox" style="position:absolute; margin: auto; top: 510px;right: 0;bottom: 0;left: 450px;"></div>`);
		document.getElementById('toproom').insertAdjacentHTML("afterend", 
		`<div id="newszoombox" style="width:850px;height:600px;background-color: #110501df; visibility: hidden; z-index:4; position:absolute; margin: 0px auto 0px auto; top: 100px;left: 0; right: 0;"></div>`);
		document.getElementById('newszoombox').insertAdjacentHTML("afterbegin", 
		`<div id="newszoomflex" style="width:850px;height:600px; gap:800px 800px; display:flex; overflow: hidden; position:absolute; margin: auto;"></div>`);
	}
	newszoombox.insertAdjacentHTML("beforeend",
	`<div class="newsturnleft" style="font-size:xxx-large; transform: scaleY(3); float:left;width: 20px;height: 100px; position:absolute;top: 50%; color: #8e8b88;">≪</div><div class="newsturnright" style="transform: scaleY(3); font-size:xxx-large; float:right;width: 20px;height: 100px;position:absolute;top: 50%; right: 0px; color: #8e8b88;">≫</div>`);
	newsflexbox.insertAdjacentHTML("afterbegin",
	`<div id="newsflex" style=" display:flex; overflow: hidden; height: 160px; width: 350px; margin: auto;background-color: #241f17;"></div>`);
	newsflexbox.insertAdjacentHTML("beforeend", 
	`<div class="newsturnleft" style="float:left;width: 20px;height: 100px;z-index:1; position:absolute;top: 20px;"></div><div class="newsturnright" style="float:right;width: 20px;height: 100px;position:absolute;top: 20px;right: 0px;z-index:1;"></div>`);
	var newsflex = document.getElementById(`newsflex`);

    const DISPLAY_NEWS_COUNT = 4;
    const newsItems = exhibitions.slice(Math.max(0, exhibitions.length - DISPLAY_NEWS_COUNT)).reverse();

    newsItems.forEach((exhibition, index) => {
        const calImageIndex = parseInt(exhibition.calImage.filename) - 1;
        const zoomImageIndex = parseInt(exhibition.zoomImage.filename) - 1;

        // cal[calImageIndex]が有効なImageオブジェクトであることを確認
        // Imageのwidthまたはheightが0の場合は、画像の読み込みに失敗している可能性がある
        if (cal[calImageIndex] && cal[calImageIndex].width > 0 && cal[calImageIndex].height > 0) {
            var newsimgheight=cal[calImageIndex].height*0.6;
            var newsimgwidth=cal[calImageIndex].width*0.6;
            if(cal[calImageIndex].height==200){
                newsimgwidth=cal[calImageIndex].width*0.4;
                newsimgheight=cal[calImageIndex].height*0.4;
            }
            inboxCan = `<div id="newsbox${index+1}" style="width: 150px;height:100px; margin: 1%;"><canvas id="news${index+1}" width="${newsimgwidth}px" height="${newsimgheight}px" style=" margin: 10px 0 0 10px;"></canvas></div>`;
            newsflex.insertAdjacentHTML("beforeend", inboxCan);
            newsCan[index+1] = document.getElementById(`news${index+1}`);
            ctxnews[index+1] = newsCan[index+1].getContext('2d');
            ctxnews[index+1].drawImage(cal[calImageIndex], 0, 0, cal[calImageIndex].width, cal[calImageIndex].height, 0, 0, newsimgwidth, newsimgheight);
        } else {
            console.warn(`Warning: cal image for exhibition '${exhibition.name}' (index: ${calImageIndex}) could not be drawn. Image might be missing or failed to load.`);
            // 画像が表示されない場合の代替コンテンツや、エラー表示などのハンドリングをここに追加できます
            inboxCan = `<div id="newsbox${index+1}" style="width: 150px;height:100px; margin: 1%; background-color: #333; color: #eee; text-align: center; line-height: 100px;">画像なし</div>`;
            newsflex.insertAdjacentHTML("beforeend", inboxCan);
        }

        const formattedDateForNews = formattedDates[exhibitions.indexOf(exhibition)];
        inboxCan = `<div id="newtex${index+1}" style="margin: -0px 0px 0px 5px; color: #988; width:150px;"><p style="font-size: 12px;margin:0px;">${exhibition.name}<br><font style="font-size: xx-small;">${formattedDateForNews}<br>${exhibition.time}</font></p></div>`;
        document.getElementById(`newsbox${index+1}`).insertAdjacentHTML("beforeend", inboxCan);
        
        // zoom画像も同様に確認
        if (zooms[zoomImageIndex] && zooms[zoomImageIndex].width > 0 && zooms[zoomImageIndex].height > 0) {
            if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
                var newszoomheight=zooms[zoomImageIndex].height/2;
                var newszoomwidth=zooms[zoomImageIndex].width/2;
                if(zooms[zoomImageIndex].height==800){
                    newszoomheight=zooms[zoomImageIndex].height*0.7/2;
                    newszoomwidth=zooms[zoomImageIndex].width*0.7/2;
                }
                newszoomflex.insertAdjacentHTML("beforeend", `<div id="newszoombox${index+1}" style="width: 425px;height:300px; flex-shrink: 0;"><canvas id="newszooms${index+1}" width="${newszoomwidth}px" height="${newszoomheight}px" style=" margin: 25px;"></canvas></div>`);
            } else {
                var newszoomheight=zooms[zoomImageIndex].height;
                var newszoomwidth=zooms[zoomImageIndex].width;
                if(zooms[zoomImageIndex].height==800){
                    newszoomheight=zooms[zoomImageIndex].height*0.7;
                    newszoomwidth=zooms[zoomImageIndex].width*0.7;
                }
                newszoomflex.insertAdjacentHTML("beforeend", `<div id="newszoombox${index+1}" style="width: 850px;height:600px; flex-shrink: 0;"><canvas id="newszooms${index+1}" width="${newszoomwidth}px" height="${newszoomheight}px" style=" margin: 0px;"></canvas></div>`);
            }
            newszoomCan[index+1] = document.getElementById(`newszooms${index+1}`);
            ctxnewszoom[index+1] = newszoomCan[index+1].getContext('2d');
            ctxnewszoom[index+1].drawImage(zooms[zoomImageIndex], 0, 0, zooms[zoomImageIndex].width, zooms[zoomImageIndex].height, 0, 0, newszoomwidth, newszoomheight);
        } else {
            console.warn(`Warning: zoom image for exhibition '${exhibition.name}' (index: ${zoomImageIndex}) could not be drawn. Image might be missing or failed to load.`);
            if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
                newszoomflex.insertAdjacentHTML("beforeend", `<div id="newszoombox${index+1}" style="width: 425px;height:300px; flex-shrink: 0; background-color: #333; color: #eee; text-align: center; line-height: 300px;">画像なし</div>`);
            } else {
                newszoomflex.insertAdjacentHTML("beforeend", `<div id="newszoombox${index+1}" style="width: 850px;height:600px; flex-shrink: 0; background-color: #333; color: #eee; text-align: center; line-height: 600px;">画像なし</div>`);
            }
        }

        if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
            inboxCan = `<div id="newszoomtex${index+1}" style="width:400px; margin:0px auto; color: #988;"><p style="font-size: 15px;margin: 0px 0px 5px 0px;">${exhibition.name}<br><font style="font-size: xx-small;">${formattedDateForNews}<br>${exhibition.time}</font></p><p style="font-size: xx-small; margin: 0px 0px 5px 0px;">${exhibition.exhibitors.join(', ')}<br>${exhibition.comments}</p></div>`;
            document.getElementById(`newszoombox${index+1}`).insertAdjacentHTML("beforeend", inboxCan);
        } else {
            inboxCan = `<div id="newszoomtex${index+1}" style="width:800px; margin:0px auto; color: #988;"><p style="font-size: 15px;margin: 0px 0px 5px 0px;">${exhibition.name}<br><font style="font-size: xx-small;">${formattedDateForNews}<br>${exhibition.time}</font></p><p style="font-size: xx-small; margin: 0px 0px 5px 0px;">${exhibition.exhibitors.join(', ')}<br>${exhibition.comments}</p></div>`;
            document.getElementById(`newszoombox${index+1}`).insertAdjacentHTML("beforeend", inboxCan);
        }
    });

    PopAnim(document.getElementById('newszoombox'),5000,0);
    NewsSlide(document.getElementsByClassName('newsturnright'),document.getElementsByClassName('newsturnleft'),newszoomflex,0);
    NewsSlide(document.getElementsByClassName('newsturnright'),document.getElementsByClassName('newsturnleft'),newsflex,0);
}

// PopAnim, NewsSlide, SetBox, HoldMoves 関数 (変更なし)
function PopAnim(target_element, sec, n) {
	let anim = target_element.animate(
		[{opacity: '0'}, {opacity: '1'}],
		{
			duration: sec,
			fill: 'forwards',
			easing: 'ease-in',
			delay: n
		}
	);
	anim.onfinish = function() {
		target_element.style.visibility = 'visible';
	};
}

function NewsSlide(right_elements,left_elements,target_element,n) {
    let slideLock = false;
    let rightCounter = 0;
    let leftCounter = 0;
    
    Array.from(right_elements).forEach(element => {
        element.addEventListener(pointstart, () => {
            if (slideLock) return;
            slideLock = true;
            rightCounter = rightCounter + 800; // 変更するピクセル数
            if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
                rightCounter = rightCounter + 400; // 変更するピクセル数
            }
            target_element.animate(
                [
                    { transform: `translateX(-${leftCounter}px)` },
                    { transform: `translateX(-${rightCounter}px)` }
                ],
                {
                    duration: 500, // アニメーション時間
                    easing: 'ease-in-out',
                    fill: 'forwards'
                }
            ).onfinish = () => {
                leftCounter = rightCounter;
                slideLock = false;
            };
        });
    });

    Array.from(left_elements).forEach(element => {
        element.addEventListener(pointstart, () => {
            if (slideLock) return;
            slideLock = true;
            leftCounter = leftCounter - 800; // 変更するピクセル数
             if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
                leftCounter = leftCounter - 400; // 変更するピクセル数
            }
            if (leftCounter < 0) { // 最小値を0に制限
                leftCounter = 0;
            }
            target_element.animate(
                [
                    { transform: `translateX(-${rightCounter}px)` },
                    { transform: `translateX(-${leftCounter}px)` }
                ],
                {
                    duration: 500, // アニメーション時間
                    easing: 'ease-in-out',
                    fill: 'forwards'
                }
            ).onfinish = () => {
                rightCounter = leftCounter;
                slideLock = false;
            };
        });
    });
}

function SetBox(target_element, long_func, normal_func) {
    let longclick = false;
    let touch = false;
    let sec = 500;
    let timer;
    let movetimer;
    let touchmovelock = false;

    target_element.addEventListener('touchstart', (event) => {
        event.preventDefault(); // デフォルトのスクロール動作を抑制
        touchmovelock = false; // 新しいタッチイベントでロックをリセット
        touch = true;
        longclick = false; // longclickをリセット

        timer = setTimeout(() => {
            longclick = true;
            long_func();
        }, sec);
    });

    target_element.addEventListener('touchend', () => {
        clearTimeout(timer);
        if (!touchmovelock) { // touchmoveがなかった場合のみnormal_funcを実行
            normal_func();
        }
        touch = false; // イベント終了時にtouchフラグをリセット
        clearTimeout(movetimer); // touchmoveタイマーもクリア
    });

    target_element.addEventListener('touchmove', () => {
        // touchmoveが発生したら、longclickの実行をキャンセル
        clearTimeout(timer);
        // movetimerを設定し、一定時間内にtouchmoveが続く限りtouchmovelockをtrueに保つ
        movetimer = setTimeout(() => {
            touchmovelock = true;
        }, 50);
    });

    target_element.addEventListener('mousedown', () => {
        if (touch) return; // タッチイベント中は無視
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
            // 通常クリック時の処理をここに追加 (もしあれば)
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
        touchmove_func(event); // ここでtouchmove_funcを呼び出す
    });
    target_element.addEventListener('mousedown', () => {
        if (touch) return;
        longclick = false;
        timer = setTimeout(() => {
            longclick = true;
        }, sec);
    });
    target_element.addEventListener('mouseup', () => {
        if (!longclick) {
            clearTimeout(timer);
        } else {
            touch = false; // マウスアップでリセット
        }
    });
    target_element.addEventListener('mousemove', (event) => {
        if (!touch && longclick) { // マウスドラッグ中のみ実行
            touchmove_func(event);
        }
    });
}


function menuSet() {
	SetBox(home,()=>{PopAnim(totobox, 500,0);},{});
	SetBox(about,()=>{PopAnim(about, 500,0);},{});
	SetBox(past,()=>{PopAnim(gallery, 500,0);},{});
	SetBox(team,()=>{PopAnim(team, 500,0);},{});
	SetBox(callfor,()=>{PopAnim(callfor, 500,0);},{});
	SetBox(contact,()=>{PopAnim(contact, 500,0);},{});
}
/*
function Gcalender(){
    gapi.client.init({
        'apiKey': 'YOUR_API_KEY', // ここにGoogle Calendar APIのAPIキーを設定
        'discoveryDocs': ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'],
    }).then(function() {
        return gapi.client.calendar.events.list({
            'calendarId': 'YOUR_CALENDAR_ID', // ここにGoogle CalendarのIDを設定
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 10,
            'orderBy': 'startTime'
        });
    }).then(function(response) {
        var events = response.result.items;
        var output = '';
        if (events.length > 0) {
            for (var i = 0; i < events.length; i++) {
                var event = events[i];
                var when = event.start.dateTime;
                if (!when) {
                    when = event.start.date;
                }
                output += event.summary + ' (' + when + ')\n';
            }
        } else {
            output = 'No upcoming events found.\n';
        }
        // console.log(output); // デバッグ用にイベント情報をコンソールに出力
        // ここで取得したイベント情報をWebページに表示する処理を追加
        // 例: document.getElementById('calendar_events').innerText = output;
    }, function(reason) {
        console.error('Error: ' + reason.result.error.message);
    });
}
	*/