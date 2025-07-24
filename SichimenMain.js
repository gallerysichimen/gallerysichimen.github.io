

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
const cal = new Array();
const img = new Array();
const news = new Array();
const zooms = new Array();
const newsCan = new Array();
const ctxnews = new Array();
const newszoomCan = new Array();
const ctxnewszoom = new Array();
let calimg = new Array();
const ctxcal = new Array();
let newsNum =0;

let pointstart;
let pointend;
let pointmove;
window.scrollTo( 0, 0);

const gallery_map = document.getElementById("gallery_map");
const team_container = document.getElementById('team_container');
window.addEventListener('DOMContentLoaded', () => {
	window.addEventListener('exhibitionsLoaded', (event) => {
		const allExhibitions = event.detail.exhibitions;
        const formattedExhibitionDates = event.detail.formattedDates;

		let imagesLoadedCount = 0;
        let actualImagesToLoad = 0; 
		const now = new Date();
		
		allExhibitions.forEach((exhibition, index) => {
            // calとzoomsの各要素を必ずImageオブジェクトとして初期化します。
            cal[index] = new Image();
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

			const endDate = new Date(`${exhibition.endDate}T23:59:59`); 

			if (now <= endDate) {
                actualImagesToLoad++;
				zooms[newsNum] = new Image();
                zooms[newsNum].src = `img/zoom/${exhibition.zoomImage.filename}.${exhibition.zoomImage.extension}`;
                zooms[newsNum].onload = () => {
                    imagesLoadedCount++;
                    if (imagesLoadedCount === actualImagesToLoad) {
                        onAllImagesLoaded(allExhibitions, formattedExhibitionDates);
                    }
                };
                zooms[newsNum].onerror = () => {
                    console.error(`Failed to load zoom image: ${zooms[newsNum].src}. This image might not exist.`);
                    imagesLoadedCount++;
                    if (imagesLoadedCount === actualImagesToLoad) {
                        onAllImagesLoaded(allExhibitions, formattedExhibitionDates);
                    }
                };

				newsNum++;

            } 
			
        });

        // 実際にロードを試みる画像が一つもない場合の対応
        if (actualImagesToLoad === 0) {
            onAllImagesLoaded(allExhibitions, formattedExhibitionDates);
        }
    });

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
	 // img[1], img[2], img[3] のロード (静的な画像)
    for (let i = 1; i <= ImgsNum; i++) {
        img[i] = new Image();
        img[i].src = `../img/img${i}.jpg`;
    }
	misc = new Image();
	misc.src=`../img/misc.png`

	misc.onload = function (){
		ctxtitle.drawImage(misc, 0, 0, 400, 50, 0, 0, 400, 50);
	}
})

function onAllImagesLoaded(allExhibitions, formattedExhibitionDates) {
    calimg = new Array(allExhibitions.length);
	
    // RoomPreparなど、calやzooms配列に依存する関数をここで呼び出す
    RoomPrepar(allExhibitions, formattedExhibitionDates);
    gapi.load('client', Gcalender);
}

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


function RoomPrepar(exhibitions, formattedDates){
	if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
		home.insertAdjacentHTML("beforebegin", `<div id="toproom" style=" visibility: hidden; position: absolute; background-color: #9b846d; height: 500px;width: 450px;top: 50px; left: 0; right:0; margin: auto; z-index:1;"></div>`);
		let calendar_container = document.getElementById("calendar_container")
		calendar_container.style.left="-80px";
	}
	else{
		home.insertAdjacentHTML("beforebegin", `<div id="toproom" style=" visibility: hidden; position: absolute; background-color: #9b846d; height: 500px;width: 800px;top: 50px; left: 0; right:0; margin: auto; z-index:1;"></div>`);
	}
	PopAnim(document.getElementById('toproom'), 5000,0);
	NewsEvent(exhibitions, formattedDates);
}
	
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
	var newsflexbox = document.getElementById('newsflexbox');
	var newszoomflex = document.getElementById('newszoomflex');
	newszoombox.insertAdjacentHTML("beforeend",
	`<div class="newsturnleft" style="font-size:xxx-large; transform: scaleY(3); float:left;width: 20px;height: 100px; position:absolute;top: 50%; color: #8e8b88;">≪</div><div class="newsturnright" style="transform: scaleY(3); font-size:xxx-large; float:right;width: 20px;height: 100px;position:absolute;top: 50%; right: 0px; color: #8e8b88;">≫</div>`);
	newsflexbox.insertAdjacentHTML("afterbegin",
	`<div id="newsflex" style=" display:flex; overflow: hidden; height: 160px; width: 350px; margin: auto;background-color: #241f17;"></div>`);
	newsflexbox.insertAdjacentHTML("beforeend", 
	`<div class="newsturnleft" style="float:left;width: 20px;height: 100px;z-index:1; position:absolute;top: 20px;"></div><div class="newsturnright" style="float:right;width: 20px;height: 100px;position:absolute;top: 20px;right: 0px;z-index:1;"></div>`);
	var newsflex = document.getElementById(`newsflex`);
	let inboxCan;
	for(i=0; i < newsNum; i++){
		let fixed_i = exhibitions.length-newsNum + i;
		var newsimgheight=cal[fixed_i].height*0.6;
		var newsimgwidth=cal[fixed_i].width*0.6;
		if(cal[fixed_i].height==200){
			newsimgwidth=cal[fixed_i].width*0.4;
			newsimgheight=cal[fixed_i].height*0.4;
		}
		inboxCan = `<div id="newsbox${i}" style="width: 150px;height:100px; margin: 1%;"><canvas id="news${i}" width="${newsimgwidth}px" height="${newsimgheight}px" style=" margin: 10px 0 0 10px;"></canvas></div>`;
		newsflex.insertAdjacentHTML("beforeend", inboxCan);
		newsCan[i] = document.getElementById(`news${i}`);
		ctxnews[i] = newsCan[i].getContext('2d');
		ctxnews[i].drawImage(cal[fixed_i], 0, 0, cal[fixed_i].width, cal[fixed_i].height, 0, 0, newsimgwidth, newsimgheight);
		inboxCan = `<div id="newtex${i}" style="margin: -0px 0px 0px 5px; color: #988; width:150px;"><p style="font-size: 12px;margin:0px;">${exhibitions[fixed_i].name}<br><font style="font-size: xx-small;">${formattedDates[fixed_i]}<br>${exhibitions[fixed_i].time}</font></p></div>`;
		document.getElementById(`newsbox${i}`).insertAdjacentHTML("beforeend", inboxCan);

		if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
			var newszoomheight=zooms[i].height/2;
			var newszoomwidth=zooms[i].width/2;
			if(zooms[i].height==800){
				newszoomheight=zooms[i].height*0.7/2;
				newszoomwidth=zooms[i].width*0.7/2;
			}
			newszoomflex.insertAdjacentHTML("beforeend",
			`<div id="newszoombox${i}" style="width: 425px;height:300px; flex-shrink: 0;"><canvas id="newszooms${i}" width="${newszoomwidth}px" height="${newszoomheight}px" style=" margin: 25px;"></canvas></div>`);
		
		}
		else{
			var newszoomheight=zooms[i].height;
			var newszoomwidth=zooms[i].width;
			if(zooms[i].height==800){
				newszoomheight=zooms[i].height*0.7;
				newszoomwidth=zooms[i].width*0.7;
			}
			newszoomflex.insertAdjacentHTML("beforeend",
			`<div id="newszoombox${i}" style="width: 850px;height:600px; flex-shrink: 0;"><canvas id="newszooms${i}" width="${newszoomwidth}px" height="${newszoomheight}px" style=" margin: 25px;"></canvas></div>`);
		
		}
		newszoomCan[i] = document.getElementById(`newszooms${i}`);
		ctxnewszoom[i] = newszoomCan[i].getContext('2d');
		ctxnewszoom[i].drawImage(zooms[i], 0, 0, zooms[i].width, zooms[i].height, 0, 0, newszoomwidth, newszoomheight);
	}
	NewsZoomer();
	NowaDayNews(exhibitions);
	
	if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
		totobox.insertAdjacentHTML("afterbegin", `<canvas id="toto" width="200px" height="200px" style="position:absolute; margin: auto;top: 380px;right: 0px;left: 250px; z-index:3;"></canvas>`);
	}
	else{
		totobox.insertAdjacentHTML("afterbegin", `<canvas id="toto" width="200px" height="200px" style="position:absolute; margin: auto;top: 680px;right: 0px;left: ${window.innerWidth-200}px; z-index:3;"></canvas>`);
	}
	const toto = document.getElementById('toto');
	var ctxtoto = toto.getContext('2d');
	ctxtoto.drawImage(misc, 500, 500, 200, 200, 0, 0, 200, 200);
	PopAnim(document.getElementById('toto'), 5000,0);

	AboutMove();  CallforMove();

	AchiveFolder(exhibitions,formattedDates);
	
}

function NowaDayNews(exhibitions){
	let nowaday = new Date();
	var topnews = document.getElementById("newsflex");  

	for(i = exhibitions.length - newsNum; i < exhibitions.length; i++){
		const startDate = new Date(`${exhibitions[i].startDate}T00:00:00`);
		const endDate = new Date(`${exhibitions[i].endDate}T23:59:59`); 
		if(startDate <= nowaday && nowaday <= endDate){
			topnews.scrollLeft = 150*i-100;
			break;
		}
		else if(i >= newsNum-1){
			if(endDate < nowaday){
			topnews.scrollLeft = 150*0-100;
			break;
			}
			if(startDate > nowaday){
				topnews.scrollLeft = 150*(newsNum-1)-100;
				break;
			}
		}
		
	}
}

const about_container=document.getElementById('about_container');
const about_contents=document.getElementById('about_contents');
const about_contents1=document.getElementById('about_contents1');
const about_contents2=document.getElementById('about_contents2');
function AboutMove(){
	if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
		
		about.insertAdjacentHTML("afterbegin", `<canvas id="img1" class="img" width="400px" height="225px" style=";position:relative; top: 25px;  margin: auto; z-index:1;"></canvas>`);
		about.insertAdjacentHTML("beforeend", `<canvas id="img2" class="hopper" width="200px" height="112px" style="position:relative; top: -140px;left: -80px; margin: auto; z-index:1; visibility: hidden;"></canvas>`);
		about.insertAdjacentHTML("beforeend", `<canvas id="img3" class="hopper" width="200px" height="112px" style="position:relative; top: -260px;left: 150px; margin: auto;z-index: 0;visibility: hidden;"></canvas>`);
		about.style.height="1000px";
		about_container.style.width="450px";
		about_container.style.height="550px";
		about_container.style.left="0px";
		about_container.style.top="10px";
		about_container.style.padding="100px 0 100px 0";
		about_contents.style.left="0px";
		about_contents.style.top="0px";
		about_contents.style.width="450px";
		about_contents1.style.float="none";
	}
	else{
		about.insertAdjacentHTML("afterbegin", `<canvas id="img1" class="img" width="400px" height="225px" style=";position:relative; top: -140px; left: -200px; margin: auto; z-index:1;"></canvas>`);
		about.insertAdjacentHTML("beforeend", `<canvas id="img2" class="hopper" width="200px" height="112px" style="position:relative; top: -400px;left: 450px; margin: auto; z-index:1; visibility: hidden;"></canvas>`);
		about.insertAdjacentHTML("beforeend", `<canvas id="img3" class="hopper" width="200px" height="112px" style="position:relative; top: -320px;left: 80px; margin: auto;z-index: 0;visibility: hidden;"></canvas>`);
	}
	
	const img1=document.getElementById('img1');
	const ctximg1 = img1.getContext('2d');
	ctximg1.drawImage(img[1], 0, 0, 400, 225, 0, 0, 400, 225);
	Popimg1(true);

	const img2=document.getElementById('img2');
	const ctximg2 = img2.getContext('2d');
	ctximg2.drawImage(img[2], 0, 0, 200, 112, 0, 0, 200, 112);

	const img3=document.getElementById('img3');
	const ctximg3 = img3.getContext('2d');
	ctximg3.drawImage(img[3], 0, 0, 200, 112, 0, 0, 200, 112);
	stopper=false;
}
function Popimg1(pop){
	if(!pop){img1.animate([{opacity: '0.5'},{opacity: '1'}],1000);
	img1.style.opacity =`1`; return;}pop =true;
	img1.animate([{opacity: '0',  transform:'translate(0, 100px)'},{opacity: '0.5',  transform:'translate(0, 0px)'}],1500);
	img1.style.opacity =`0.5`;
	
}
let totostop=false;

function ToToMove(){
	let totohead;
	let tototitle;
	if(totostop)
	{
		totohead= document.getElementById('totohead');
		tototitle= document.getElementById('tototitle');
		document.getElementById('toto').style.margin="0px";
		totohead.style.margin="0px";
		tototitle.style.margin="0px";
		totoStopTop = window.innerHeight+window.pageYOffset-200;
		totoStopLeft = window.innerWidth-200;
		toto.style.position = 'absolute'; toto.style.top = `${totoStopTop}px`; toto.style.left = `${totoStopLeft}px`;
		tototitle.style.position = 'absolute'; tototitle.style.top = `${totoStopTop+150}px`; tototitle.style.left = `${totoStopLeft-320}px`;
		totohead.style.position = 'absolute'; totohead.style.top = `${totoStopTop-18}px`; totohead.style.left = `${totoStopLeft+46}px`;
		var lastdegree=0;
		var nowdegree=30;
		totohead.insertAdjacentHTML("beforebegin", 
			`<div id="hitbox" style="position:absolute;width:200px;height:200px;top: ${totoStopTop-128}px;background-color: #80292901;left: ${totoStopLeft-96}px; z-index:4; display:none;"></div>`);

		
		var hitbox =document.getElementById('hitbox');
		var first=true;
		HoldMoves(totohead,totomouseover);
		function totomouseover(){
			first=true;
			hitbox.style.display="block";
		};
		HoldMoves(hitbox,totomousemove);
		function totomousemove(){
			var mousePosY;
			mousePosY= event.offsetY
			if(mousePosY<130 && first){
				first=false;
				totohead.animate([{ transform: `rotate(${lastdegree}deg)`},{ transform: `rotate(${nowdegree}deg)`}],{fill: "forwards", duration: 300})
			}
			if(mousePosY>130 && !first){
				first=true;
				totohead.animate([{ transform: `rotate(${nowdegree}deg)`},{ transform: `rotate(${lastdegree}deg)`}],{fill: "forwards", duration: 300})
			}
			if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
				totohead.animate([{ transform: `rotate(${lastdegree}deg)`},{ transform: `rotate(${nowdegree}deg)`}],{fill: "forwards", duration: 300}).finished
				.then(() =>totohead.animate([{ transform: `rotate(${nowdegree}deg)`},{ transform: `rotate(${lastdegree}deg)`}],{fill: "forwards", duration: 300}));
			}

		};
		
		hitbox.addEventListener(`mouseleave`, function(){
			hitbox.style.display="none";
		});
		
		return;
	}
	toto.style.opacity = `0`;
	var ctxtoto = toto.getContext('2d');
	ctxtoto.clearRect(0, 0, 200, 200);
	toto.style.position = 'fixed';
	window_height=window.innerHeight;
	window_width=window.innerWidth;
	toto.style.top=`${window_height-200}px`;
	
	toto.style.left=`${window_width-200}px`;
	
	toto.style.opacity = `1`;
	ctxtoto.drawImage(misc, 300, 500, 200, 200, 0, 0, 200, 200);
	PopAnim(toto,3000,0)
	new Promise(function(resolve) {
    resolve()
	}).then(function() {
		setTimeout(function() {
			ctxtoto.clearRect(0, 0, 200, 200);
			ctxtoto.drawImage(misc, 100, 500, 200, 200, 0, 0, 200, 200);
			
			totobox.insertAdjacentHTML("beforeend", `<canvas id="totohead" width="100px" height="100px" style="position:fixed; margin: auto;top:${window_height-218}px;right: 0px;left: ${window_width-216}px; z-index:3;"></canvas>`);
			
			totohead = document.getElementById('totohead');
			ctxtotohead = totohead.getContext('2d');
			ctxtotohead.drawImage(misc, 0, 600, 100, 100, 0, 0, 100, 100);
			PopAnim(toto,3000,0);PopAnim(totohead,3000,0);
		}, 1000);
	}).then(function() {
		setTimeout(function() {
		
		totobox.insertAdjacentHTML("beforeend", `<canvas id="tototitle" width="400px" height="50px" style="position:fixed; margin: auto;top:${window_height-50}px;right: 0px;left: ${window_width-650}px; z-index:3;"></canvas>`);		
	
		tototitle = document.getElementById('tototitle');
		ctxtototitle = tototitle.getContext('2d');
		if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
			ctxtototitle.drawImage(misc, 0, 0, 400, 50, 50, 2, 350, 48);
		}
		else{
			ctxtototitle.drawImage(misc, 0, 0, 400, 50, 0, 0, 400, 50);
		}
		
		PopAnim(tototitle,2000,0);
		}, 2000);
	})
	window.addEventListener('scroll', ()=> {
		
	})
}
const clickYear = new Array();
let testnum=0;
function AchiveFolder(exhibitions ,formattedDates){
	if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
		past.insertAdjacentHTML("afterbegin", 
		`<div id="achivebox" style="position:relative; background-color:#191a17; margin: auto; width: 450px; height:430px; display:flex; overflow: scroll;flex-wrap: wrap; padding: 0px; align-items: center;"></div>`);
		past.insertAdjacentHTML("afterbegin",
		`<div id="yearmenu" style="padding: 25px; justify-content: center; display: flex;"></div>`);
		document.getElementById(`yearmenu`).insertAdjacentHTML("afterbegin",
		`<div id="yearbox" style="display: flex;justify-content: center;"></div>`);
		past.style.height="430px";
	}
	else{
		past.insertAdjacentHTML("afterbegin", 
		`<div id="achivebox" style="position:relative; background-color:#191a17; margin: auto; width: 910px; height:430px; display:flex; overflow: scroll;flex-wrap: wrap; padding: 50px; align-items: center;"></div>`);
		past.insertAdjacentHTML("afterbegin",
		`<div id="yearmenu" style="padding: 25px; justify-content: center; display: flex;"></div>`);
		document.getElementById(`yearmenu`).insertAdjacentHTML("afterbegin",
		`<div id="yearbox" style="display: flex;justify-content: center;"></div>`);
	}
	
	
	const achivebox = document.getElementById('achivebox');
	for(i=0; i <exhibitions.length  ; i++){
		
		achivebox.insertAdjacentHTML("afterbegin", `<canvas id="flyer${i}" class="hopper ${exhibitions[i].year}" height="200px" width="200px" style=" margin:4px;visibility: hidden;"></canvas>`);
		calimg[i]=document.getElementById(`flyer${i}`);
		ctxcal[i]= calimg[i].getContext('2d')
		var caldraw_sp=(200-cal[i].width)/2;
		ctxcal[i].drawImage(cal[i], 0, 0, cal[i].width, cal[i].height, caldraw_sp, 0, cal[i].width, cal[i].height);
		calimg[i].insertAdjacentHTML("afterend", `<div id="achive${i}" class="hopper ${exhibitions[i].year}"  style=" margin:4px 30px 4px 4px; width:200px; height:300px; color:#777777;font-size:small;visibility: hidden;">
		<p style="background: radial-gradient(#4d2821a3 10%, #0000 60%)">${formattedDates[i]}</p>
		<p>${exhibitions[i].name}</p>
		<p>${exhibitions[i].exhibitors}</p>
		<p style="margin-top: 2em;">${exhibitions[i].comments}</p>
		</div>`);
		if(i<exhibitions.length-1 ){
			if(exhibitions[i].year<exhibitions[i+1].year){
				calimg[i].insertAdjacentHTML("beforebegin",
				`<div id="${exhibitions[i].year}" class="hopper" style=" margin:10px 50px 0px 50px; width:800px; height:50px; color:#777777;font-size:x-large; text-align: left; visibility: hidden;">${exhibitions[i].year}</div>`);
			
				document.getElementById(`yearbox`).insertAdjacentHTML("afterbegin",
				`<div id="tag${exhibitions[i].year}" class="menu2">${exhibitions[i].year}</div>`);
				 SetYearJump(i)
			}
			
		}
		else{
			achivebox.insertAdjacentHTML("afterbegin",
			`<div id="${exhibitions[i].year}" class="hopper"  style=" margin:10px 50px 0px 50px; width:800px; height:50px; color:#777777;font-size:x-large; text-align: left;visibility: hidden;">${exhibitions[i].year}</div>`);
			document.getElementById(`yearbox`).insertAdjacentHTML("afterbegin",
				`<div id="tag${exhibitions[i].year}" class="menu2">${exhibitions[i].year}</div>`);
				SetYearJump(i)
				menuSet()
		}
	}
	
	achivebox.addEventListener('scroll', ()=> {
		for(i=0; i<hopper.length; i++){
			if(achivebox.scrollTop > hopper[i].offsetTop-300&& !hrock[i]){
				hrock[i]=true;
				PopAnim(hopper[i],1000,1);
			}
		}
	});
	function SetYearJump(i){
		document.getElementById(`tag${exhibitions[i].year}`).addEventListener('click', function() {
			GoScroll(`${exhibitions[i].year}`);
		});
	}
}
	

function GoScroll(flex_obj) {
	document.getElementById(flex_obj).scrollIntoView({
	behavior:"smooth",  block:"start",  inline:"nearest",  
	}) 
}

const API_KEY = 'AIzaSyBoM6H0NBxC_F0fmvDfCou_ennvi8qnrD0'
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

  var firstDay = ( new Date( year, month ) ).getDay();
	let GformDatesS = new Array();
	let GformDatesE = new Array();

  tbl = document.getElementById("calendar-body");

  tbl.innerHTML = "";

  monthAndYear.innerHTML = months[month] + " " + year;
  selectYear.value = year;
  selectMonth.value = month;

  // creating all cells
  var date = 1;
  for ( var i = 0; i < 6; i++ ) {
      var row = document.createElement("tr");

      for ( var j = 0; j < 7; j++ ) {
          if ( i === 0 && j < firstDay ) {
              cell = document.createElement( "td" );
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
			  if ( date === today.getDate() && year === today.getFullYear() && month === today.getMonth() ) {
                  cell.className = "date-picker selected";
              }
			  
			  for(let k=0;k<startDates.length;k++){
				GformDatesS = startDates[k].match(Gdateform);
				GformDatesE = endDates[k].match(Gdateform);
				if(year == GformDatesS[1]&&year == GformDatesE[1]&& month+ 1 == GformDatesS[2] && date == GformDatesS[3]||
				year == GformDatesS[1]&&year == GformDatesE[1]&& month+ 1 == GformDatesE[2] && date == GformDatesE[3]||
				GformDatesS[1]<GformDatesE[1] && GformDatesS[1]== year && GformDatesS[2]<=month+ 1 && GformDatesS[3]<date||
				GformDatesS[1]<GformDatesE[1] && GformDatesS[1]== year && month+ 1<=GformDatesE[2] && date<GformDatesE[3]||
				GformDatesS[1]==GformDatesE[1] && GformDatesS[1]== year && GformDatesS[2]==month+ 1&&month+ 1==GformDatesE[2] && GformDatesS[3]<date&&date<GformDatesE[3]||
				GformDatesS[1]==GformDatesE[1] && GformDatesS[1]== year &&GformDatesS[2]<GformDatesE[2]&& GformDatesS[2]==month+ 1&& GformDatesS[3]<date||
				GformDatesS[1]==GformDatesE[1] && GformDatesS[1]== year &&GformDatesS[2]<GformDatesE[2]&& GformDatesS[2]<month+ 1&&GformDatesE[2]>month+ 1||
				GformDatesS[1]==GformDatesE[1] && GformDatesS[1]== year &&GformDatesS[2]<GformDatesE[2]&& GformDatesE[2]==month+ 1&&date<GformDatesE[3]
				){
					cell.className = "reserved";
					cell.title = `${items[k].summary}`;
					if ( date === today.getDate() && year === today.getFullYear() && month === today.getMonth() ) {
                  cell.className = "reserved selected";
              }
				}
			  }
			  let urldate=date;
			  let urlmonth= month+1;
			  if(urlmonth<10){urlmonth="0"+urlmonth;}
			  if(date<10){urldate="0"+date;}
			  if(cell.className == "date-picker"){
				let GculURL ="https://docs.google.com/forms/d/e/1FAIpQLSf7TfudivAz1PpLR1xiSO0zu3WEHSH_oeHXRGgMbMNr39qAtg/viewform?usp=pp_url&entry.1552810174="+`${year}-${urlmonth}-${urldate}`
				cell.innerHTML = `<span>` +`<a href="${GculURL}" target=”_blank ${url_mouse_event} style="text-decoration: none; color:#5763a6;">`+ date +"</a>"+ "</span>";
			  }
              row.appendChild(cell);
              date++;
			  
          }
      }
	  ReservedCheker()
      tbl.appendChild(row);
  }

}
			  	  
function daysInMonth(iMonth, iYear) {
	return 32 - new Date(iYear, iMonth, 32).getDate();
}
function ReservedCheker(){
	const selected = document.getElementsByClassName('selected');
	const reserved = document.getElementsByClassName('reserved');
	const reserve_tips = document.getElementById('reserve_tips');
	let mc = 0;
	let reserved_color ="#886655";
	let reserved_bcolor = "#9726";
	let reserved_bcolors = [933,386,648,500,50,5,770,77,707];
	let selected_bcolor= "#7214"
	let i= 0;
	let jpS_dates = new Array();
	let jpE_dates = new Array();
	
	while(mc < reserved.length){
		reserved[mc].style.textDecoration= "none";
		reserved[mc].style.color= reserved_color;
		if(mc>0){
			if(reserved[mc].title != reserved[mc-1].title){
				if(i>8){
					reserved_bcolors.push= Math.floor(Math.random()*1000);
				}
				reserved_bcolor = `#${reserved_bcolors[i]}4`;
				i++;
			}
		}
		reserved[mc].style.backgroundColor= reserved_bcolor;
		ReservePop(mc);
		mc++;
	}
	if(selected.length==1){
		selected[0].style.backgroundColor= selected_bcolor;
	}
	function ReservePop(j){
		reserved[j].addEventListener(`${pointstart}`, function() {
			event.preventDefault();
			for(i=0; i<items.length;i++){
				jpS_dates[i] = startDates[i];
				jpE_dates[i] = endDates[i];
				if(reserved[j].title==items[i].summary){
					jpS_dates[i]=jpS_dates[i].replace( /\d+-(\d+)-(\d+)/g , `$1月$2日～` );
					jpE_dates[i]=jpE_dates[i].replace( /\d+-(\d+)-(\d+)/g , `$1月$2日` );
					reserve_tips.innerHTML = "<p>" + items[i].summary + "</p>" + "<p>" + jpS_dates[i] + jpE_dates[i] + "</p>";
					reserve_tips.style.visibility ="visible";
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
    })
    }).then(function(response) {
		items = response.result.items;
	
		for(let i = 0; i < items.length; i++){
			startDates[i]= items[i].start.dateTime;
			endDates[i]= items[i].end.dateTime;
			if(items[i].start.dateTime === undefined){
				startDates[i]= items[i].start.date;
				startDates[i]=startDates[i].replace( /(\d+)-(\d+)\D(\d+)/g , `$1-$2-$3` );
				endDates[i]= items[i].start.date;
				endDates[i]=endDates[i].replace( /(\d+)-(\d+)\D(\d+)/g , `$1-$2-$3` );
				continue;
			}
			startDates[i]=startDates[i].replace( /(\d+)-(\d+)\D(\d+)\D\d+\D\d+\D\d+\D\d+\D\d+/g , `$1-$2-$3` );
			endDates[i]=endDates[i].replace( /(\d+)-(\d+)\D(\d+)\D\d+\D\d+\D\d+\D\d+\D\d+/g , `$1-$2-$3` );
		}
		showCalendar(currentMonth, currentYear);
    }, function(reason) {
    console.log('Error: ' + reason.result.error.message);
    });
};    




function CallforMove(){
	const callfor_text1 = document.getElementById("callfor_text1");
	const callfor_container = document.getElementById("callfor_container");
	if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)&&window.orientation===0){
		
		callfor_text1.insertAdjacentHTML("beforeend", 
			`<div id="spaceimgbox"  style="position:relative;width:300px;height:200px;top: 0px;left: 0px;background-color: #80292901; margin: auto; z-index:1;"></div>`);
		callfor_container.style.width="400px";
		callfor.style.width="450px";
	}
	else{
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
		function bigspaceoff(event){
			event.preventDefault();
			Bspace_erea.style.display= "none";
		}
		smallspace.addEventListener(`${pointstart}`, smallspaceon);
		function smallspaceon(event){
			event.preventDefault();
			Sspace_erea.style.visibility= "visible";
		}
		smallspace.addEventListener(`${pointend}`, smallspaceoff);
		function smallspaceoff(event){
			event.preventDefault();
			Sspace_erea.style.visibility= "hidden";
		}
		bigspace.addEventListener(`${pointstart}`, bigspaceon);
		function bigspaceon(event){
			event.preventDefault();
			Bspace_erea.style.display= "block";
		}
}

var endX;
var starX;
function NewsZoomer(){
	var clicklocker=false;
	newsCan.forEach(function(target) {
		if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
			long_press(target,PopNewsViewer,SampleShown);
			function SampleShown(){
				newszoombox.style.visibility= "visible";
				newszoombox.style.scale="40%";
				var target_num = target.id.replace( /news(\d+)/g , `$1` );
				document.getElementById("newszoomflex").children[target_num].scrollIntoView({
				behavior:"smooth",  block:"nearest",  inline:"nearest",  
				})
			}
		}
		else{
			target.addEventListener(`${pointstart}`, function() {
				newszoombox.style.visibility= "visible";
				newszoombox.style.scale="40%";
				var target_num = target.id.replace( /news(\d+)/g , `$1` );
				document.getElementById("newszoomflex").children[target_num].scrollIntoView({
				behavior:"smooth",  block:"nearest",  inline:"nearest",  
				})
			})
		}
		
		target.addEventListener(`${pointend}`, function() {
			if(!clicklocker){
				newszoombox.style.visibility= "hidden";
				newszoombox.style.scale="100%";
			}
			
		})
		target.addEventListener('click', PopNewsViewer);
		function PopNewsViewer(){
			newszoombox.style.visibility= "visible";
			newszoombox.style.scale="100%";
			var target_num = target.id.replace( /news(\d+)/g , `$1` );
			document.getElementById("newszoomflex").children[target_num].scrollIntoView({
			behavior:"smooth",  block:"nearest",  inline:"nearest",  
			})
			clicklocker=true;
		}
	});

	document.getElementById("home").addEventListener('click', (e) => {
	  if(!e.target.closest('#newszoombox')) {
		newszoombox.style.visibility= "hidden";
		clicklocker=false;
	  }
	})
	document.getElementById("about").addEventListener('click', (e) => {
	  if(!e.target.closest('#newszoombox')) {
		newszoombox.style.visibility= "hidden";
		clicklocker=false;
	  } 
	})

	const newsturnright = document.getElementsByClassName(`newsturnright`);
	const newsturnleft = document.getElementsByClassName(`newsturnleft`);
	const roll_target = ["newsflex","newszoomflex"]
	for(i=0; i<newsturnright.length;i++){
		Eachturn(i,roll_target[i]);
	}
	function Eachturn(i,flex_obj){
		newsturnright[i].addEventListener(`${pointstart}`, function() {
			newsturnright[i].style.backgroundColor = "rgba(100,100,100,0.3)"
			TurnRight(true,`${flex_obj}`)
		});
		newsturnright[i].addEventListener(`${pointend}`, function() {
			newsturnright[i].style.backgroundColor = "rgba(1,1,1,0)"
		});
		newsturnleft[i].addEventListener(`${pointstart}`, function() {
			TurnRight(false,`${flex_obj}`)
			newsturnleft[i].style.backgroundColor = "rgba(100,100,100,0.3)"
		});
		newsturnleft[i].addEventListener(`${pointend}`, function() {
			newsturnleft[i].style.backgroundColor = "rgba(1,1,1,0)"
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
			if(0<endX-starX){TurnRight(false,`${flex_obj}`)}
			else{TurnRight(true,`${flex_obj}`)}
		});
	}
}
let turn_right = true;
let num =0;
let turnAroundBlocker = false;
function TurnRight(turn_right,flex_obj) {
	var turn_element = document.getElementById(flex_obj); 
	if(!turnAroundBlocker){
		if(turn_right){
			if(num+1 < turn_element.children.length) { num++;}
			else{return;}
		}
		else{
			if(num-1 >= 0) { num--;}
			else{return;}
		}
	}
	
	var child = turn_element.children[num];  
	child.scrollIntoView({
		behavior:"smooth",  block:"nearest",  inline:"nearest",  
	})
	turnAroundBlocker = false;
}

let doc;
let pop= true;
let pop_direction= 0;
function PopAnim(doc,AnimTime,pop_direction){
	
	if(doc.style.display == 'none'){doc.style.display = 'block';}
	if(doc.style.visibility == 'hidden'){doc.style.visibility = 'visible';}

	if(pop_direction==0){
	doc.animate([{opacity: '0', transform: 'translate(0, 0px)'},{offset:0.1, opacity: '0.1'}, {opacity: '1', transform: 'translate(0, 0px)'}],AnimTime)
	}
	if(pop_direction==1){
	doc.animate([{opacity: '0', transform: 'translate(0, 100px)'},{offset:0.1, opacity: '0.1'}, {opacity: '1', transform: 'translate(0, 0px)'}],AnimTime)
	}
	if(pop_direction==2){
	doc.animate([{opacity: '0', transform: 'translate(-100px, 0px)'},{offset:0.1, opacity: '0.1'}, {opacity: '1', transform: 'translate(0, 0px)'}],AnimTime)
	}
	if(pop_direction==3){
	doc.animate([{opacity: '0', transform: 'translate(0px, -100px)'},{offset:0.1, opacity: '0.1'}, {opacity: '1', transform: 'translate(0, 0px)'}],AnimTime)
	}
	if(pop_direction==4){
	doc.animate([{opacity: '0', transform: 'translate(100px, 0px)'},{offset:0.1, opacity: '0.1'}, {opacity: '1', transform: 'translate(0, 0px)'}],AnimTime)
	}
}

function HeaderPops(){
	if(ScrollUpnow){
		header.animate([{opacity: '1', transform: 'translate(0, 0)'},{offset:0.9, opacity: '0.1'}, {opacity: '0', transform: 'translate(0, -100px)'}],100).finished
		.then(() => header.style.display = 'none');
	}
	if(ontop){return;}
	if(Scrollnow){
		header.style.display = 'block';
		header.animate([{opacity: '0', transform: 'translate(0, -100px)'},{offset:0.1, opacity: '0.1'}, {opacity: '1', transform: 'translate(0, 0px)'}],100)
	}
}

let set_position = 0;
let Scrollnow = false;
let ScrollUpnow = false;
let ontop = true;
const section = document.getElementsByTagName('section');
let sectionNum = 0;
var hopper = document.getElementsByClassName('hopper');
const hrock = new Array;
var container = document.getElementsByClassName('container');
let controck =new Array;
let img1rock = false;
let stopper = true;
window.addEventListener('scroll', ()=> {
    const scrollBottom = window.pageYOffset+window.innerHeight;
	if(stopper){return;}

	for(i=0; i<section.length; i++){
			if(scrollBottom>section[5].offsetTop+section[5].offsetHeight && sectionNum <=i){
			
				totostop =true;
				ToToMove();
				sectionNum++;
			}
			if(scrollBottom>section[i].offsetTop+section[i].offsetHeight && sectionNum <=i){
			
				sectionNum++;
				if(i==0){
					ToToMove();
				}
			}
	}
	for(i=0; i<hopper.length; i++){
		if(scrollBottom > hopper[i].getBoundingClientRect().top+window.pageYOffset && !hrock[i]){
			hrock[i]=true;
			PopAnim(hopper[i],1000,1);
		}
	}
	for(i=0; i<container.length; i++){
		if(scrollBottom > 700 && !controck[i]){
			PopAnim(container[i],500,2);
			controck[i]=true;
		}
	}
	if(scrollBottom>img1.getBoundingClientRect().top+window.pageYOffset && !img1rock){
		img1rock= true;
		Popimg1(false);
	}
	

	if(document.documentElement.scrollTop<500 && !ontop){
		ontop=true;
	}
	if(document.documentElement.scrollTop>=500 && ontop){
		ontop=false;
	}

	if(ScrollUpnow){
		if(Scrollnow){return;}
		if(set_position <= document.documentElement.scrollTop-5){
			HeaderPops();Scrollnow = true; ScrollUpnow =false;
		}
		set_position = document.documentElement.scrollTop;
		return;
	}
	if(set_position > document.documentElement.scrollTop){
		HeaderPops(); ScrollUpnow = true; Scrollnow = false;
	}
	set_position = document.documentElement.scrollTop;

});

if(navigator.userAgent.match(/(iPhone|iPad|iPod|Android)/i)){
	window.addEventListener("orientationchange", function() {
		if(window.orientation===0){
			gallery_map.style.width="450px";
			contact.style.width="450px";
			team.style.width="450px";
			team.style.height="1700px";
			team_container.style.height="1500px";
			gallery.style.width="450px";
			footer.style.width="450px";
			header.style.width="450px";
			document.getElementById('calendar_container').style.left="-80px";
			document.getElementById('toproom').style.width="450px";
			document.getElementById('newsflexbox').style.left="0px";
			document.getElementById('newszoombox').style.width="400px";
			document.getElementById('newszoomflex').style.width="400px";
			for(i=1; i <= newsNum ; i++){
				document.getElementById(`newszoombox${i}`).style.width="400px";
				document.getElementById(`newszooms${i}`).style.width=`${zooms[i].width/2}`;
				document.getElementById(`newszooms${i}`).style.height=`${zooms[i].height/2}`;
				if(zooms[i].height==800){
					document.getElementById(`newszooms${i}`).style.width=`${zooms[i].width*0.7/2}`;
					document.getElementById(`newszooms${i}`).style.height=`${zooms[i].height*0.7/2}`;
				}
			}
			about.style.height="1000px";
			about_container.style.width="450px";
			about_container.style.height="550px";
			about_container.style.left="0px";
			about_container.style.top="10px";
			about_container.style.padding="100px 0 100px 0";
			about_contents.style.left="0px";
			about_contents.style.top="0px";
			about_contents.style.width="450px";
			about_contents1.style.float="none";
			document.getElementById('img3').style.top="-260px";
			document.getElementById('img3').style.left="150px";
			document.getElementById('img2').style.top="-140px";
			document.getElementById('img2').style.left="-80px";
			document.getElementById('img1').style.top="25px";
			document.getElementById('img1').style.left=null;
			document.getElementById('achivebox').style.width="450px";
			document.getElementById('achivebox').style.padding="0px";
			past.style.height="430px";
			callfor_container.style.width="400px";
			callfor.style.width="450px";
			document.getElementById('spaceimgbox').style.position="relative";
			document.getElementById('spaceimgbox').style.left="0px";
		}
		else{
			gallery_map.style.width="785px";
			contact.style.width= "984px";
			team.style.width= "984px";
			team.style.height="984px";
			team_container.style.height="500px";
			gallery.style.width= "984px";
			footer.style.width= "984px";
			header.style.width="100%";
			document.getElementById('calendar_container').style.left="0px";
			document.getElementById('toproom').style.width="800px";
			document.getElementById('newsflexbox').style.left="450px";
			document.getElementById('newszoombox').style.width="850px";
			document.getElementById('newszoomflex').style.width="850px";
			for(i=1; i <= newsNum ; i++){
			document.getElementById(`newszoombox${i}`).style.width="850px";
			document.getElementById(`newszooms${i}`).style.width=`${zooms[i].width}`;
			document.getElementById(`newszooms${i}`).style.height=`${zooms[i].height}`;
				if(zooms[i].height==800){
					document.getElementById(`newszooms${i}`).style.width=`${zooms[i]*0.7.width}`;
					document.getElementById(`newszooms${i}`).style.height=`${zooms[i]*0.7.height}`;
				}
			}
			about.style.height="500px";
			about_container.style.width="820px";
			about_container.style.height="300px";
			about_container.style.left="-250px";
			about_container.style.top="-200px";
			about_container.style.padding="100px";
			about_contents.style.left="230px";
			about_contents.style.top="30px";
			about_contents.style.width="760px";
			about_contents1.style.float="left";
			document.getElementById('img3').style.top="-320px";
			document.getElementById('img3').style.left="80px";
			document.getElementById('img2').style.top="-400px";
			document.getElementById('img2').style.left="450px";
			document.getElementById('img1').style.top="-140px";
			document.getElementById('img1').style.left="-200px";
			document.getElementById('achivebox').style.width="884px";
			document.getElementById('achivebox').style.padding="50px";
			past.style.height="600px";
			callfor_container.style.width="740px";
			callfor.style.width= "984px";
			document.getElementById('spaceimgbox').style.position="absolute";
			document.getElementById('spaceimgbox').style.left="500px";
		}
	});
}

const menu = document.getElementsByClassName('menu');
const menu2 = document.getElementsByClassName('menu2');
const flex = document.getElementsByClassName('flex');
const linkcolor ="#a1b9cc";
const linkcolor2 ="#2b617b";
function menuSet(){
	
	var mc = 0;
	
	while(mc < menu.length){
		menu[mc].style.fontSize= "large";
		menu[mc].style.textDecoration= "none";
		menu[mc].style.marginTop= "3%";
		menu[mc].style.marginLeft= "1%";
		menu[mc].style.marginRight= "1%";
		menu[mc].style.color= linkcolor;
		mc++;
	}
	mc=0;
	while(mc < menu2.length){
		menu2[mc].style.fontSize= "large";
		menu2[mc].style.textDecoration= "none";
		menu2[mc].style.marginTop= "3%";
		menu2[mc].style.marginLeft= "1%";
		menu2[mc].style.marginRight= "1%";
		menu2[mc].style.color= linkcolor2;
		mc++;
	}
	mc=0;
	while(mc < flex.length){
		flex[mc].style.display= "flex";
		flex[mc].style.flexWrap= "wrap";
		flex[mc].style.justifyContent= "center";
		flex[mc].style.overflow= "hidden";
		mc++;
	}
	mc=0;
	while(mc < hopper.length){
		hopper[mc].style.visibility= "hidden";
		mc++;
	}
	var triggers = Array.from(menu);
	triggers.forEach(function(target) {
		target.addEventListener(`${pointstart}`, function() {
			target.style.color= "#e1f2ff";
		});
		target.addEventListener(`${pointend}`, function() {
			target.style.color= linkcolor;
	  });
	});
	var triggers2 = Array.from(menu2);
	triggers2.forEach(function(target) {
		target.addEventListener(`${pointstart}`, function() {
			target.style.color= "#7aa6cc";
		});
		target.addEventListener(`${pointend}`, function() {
			target.style.color= linkcolor2;
	  });
	});
}


function long_press(target_element,normal_func,long_func){
	let longclick = false;
	let longtap = false;
	let touch = false;
	let touchmovelock = false;
	let sec = 1000;
	let timer;
	let movetimer;
	target_element.addEventListener('touchstart',(event)=>{
	event.preventDefault();
	touchmovelock=false;
	touch = true; longtap = false;
	timer = setTimeout(() => {
		longtap = true; long_func();}, sec);
	})
	target_element.addEventListener('touchend',()=>{
	if(!longtap){
		clearTimeout(timer);clearTimeout(movetimer);if(!touchmovelock){normal_func()};
	}else{ touch = false; }
	})
	target_element.addEventListener('touchmove',()=>{
	movetimer = setTimeout(() => {
		touchmovelock=true;}, 50); 
	})
	target_element.addEventListener('mousedown',()=>{
	if(touch) return; longclick = false;
	timer = setTimeout(() => {longclick = true; long_func();}, sec);})
	target_element.addEventListener('click',()=>{
	if(touch){ touch = false;
		return;
	}
	if(!longclick){ clearTimeout(timer);}
	});
}

function HoldMoves(target_element,touchmove_func){
	let longclick = false;
	let longtap = false;
	let touch = false;
	let sec = 50;
	let timer;
	target_element.addEventListener('touchstart',()=>{
		touch = true; longtap = false;
		timer = setTimeout(() => {
			longtap = true; }, sec);
	})
	target_element.addEventListener('touchend',()=>{
		if(!longtap){
			clearTimeout(timer);
		}else{ touch = false; }
	})
	target_element.addEventListener('touchmove',(event)=>{
		event.preventDefault();
		touchmove_func()
	})
	target_element.addEventListener('mouseover',()=>{
		touchmove_func();
	});
	target_element.addEventListener('mousemove',()=>{
		touchmove_func();
	});
}