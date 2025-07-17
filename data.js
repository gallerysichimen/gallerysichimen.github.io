
let allExhibitions = []; // 全ての展示情報を格納する配列
let formattedExhibitionDates = []; // 表示用にフォーマットされた日付を格納する配列

// JSONファイルを読み込み、データを初期化する関数
async function loadExhibitionData() {
    try {
        // exhibitions.jsonファイルのパスは、実際の配置場所に合わせて変更してください
        // ユーザーが提供したファイルリストに基づき、exhibitions.jsonはルートにあると仮定
        const response = await fetch('exhibitions.json'); // ★変更: パスを修正
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allExhibitions = await response.json();
        console.log('展示データが正常に読み込まれました:', allExhibitions);

        // 読み込んだデータを元に日付をフォーマット
        formatExhibitionDates();

        // ★追加: データロード完了イベントをディスパッチ
        const event = new CustomEvent('exhibitionsLoaded', {
            detail: {
                exhibitions: allExhibitions.exhibitions, // exhibitions.jsonのルートオブジェクトが "exhibitions" 配列を持つため
                formattedDates: formattedExhibitionDates
            }
        });
        window.dispatchEvent(event); // windowオブジェクトを介してイベントをディスパッチ

        return allExhibitions.exhibitions; // 読み込んだデータを返す (exhibitions配列を返す)
    } catch (error) {
        console.error('展示データの読み込み中にエラーが発生しました:', error);
        return []; // エラー時は空の配列を返す
    }
}

// 展示データを表示用にフォーマットする関数
function formatExhibitionDates() {
    formattedExhibitionDates = []; // リセット
    const weekchars = ["(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"];

    // exhibitions.json の "exhibitions" 配列をループ
    allExhibitions.exhibitions.forEach(exhibition => {
        // exhibits.jsonの構造に基づき、startDateとendDateが存在する場合のみ日付をパース
        if (exhibition.startDate && exhibition.endDate) {
            const startDateStr = exhibition.startDate; // "YYYY-MM-DD"形式
            const endDateStr = exhibition.endDate; // "YYYY-MM-DD"形式

            const startDateObj = new Date(startDateStr);
            const endDateObj = new Date(endDateStr);

            // 日付を「X月Y日(曜日)」形式に変換
            const formatSingleDate = (dateObj) => {
                const month = dateObj.getMonth() + 1;
                const day = dateObj.getDate();
                const dayOfWeek = weekchars[dateObj.getDay()];
                return `${month}月${day}日${dayOfWeek}`;
            };

            const formattedStart = formatSingleDate(startDateObj);
            const formattedEnd = formatSingleDate(endDateObj);

            // ★変更: 期間が同じ日の場合（例：単日イベント）は「X月Y日(曜日)」のみ表示
            if (startDateObj.toDateString() === endDateObj.toDateString()) {
                formattedExhibitionDates.push(formattedStart);
            } else {
                formattedExhibitionDates.push(`${formattedStart}~${formattedEnd}`);
            }
        } else {
            // startDateまたはendDateが存在しない場合は、datePeriodをそのまま使用
            // ただし、exhibitions.jsonの構造ではstartDate/endDateが常に存在する想定
            formattedExhibitionDates.push(exhibition.datePeriod || "日付不明");
        }
    });
    console.log('フォーマットされた日付:', formattedExhibitionDates);
}


// 他のスクリプトから展示データにアクセスするための関数
function getExhibitions() {
    return allExhibitions.exhibitions; // exhibitions配列を返す
}

// 他のスクリプトからフォーマットされた日付にアクセスするための関数
function getFormattedExhibitionDates() {
    return formattedExhibitionDates;
}

// 初期ロード時にデータをフェッチ
loadExhibitionData(); // この関数は非同期なので、データが利用可能になるまで待つ必要がある