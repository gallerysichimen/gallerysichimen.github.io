// data.js
// このスクリプトは、展示情報をJSONファイルから非同期で読み込み、
// 必要な形式に変換して他のスクリプトに提供します。

let allExhibitions = []; // 全ての展示情報を格納する配列
let formattedExhibitionDates = []; // 表示用にフォーマットされた日付を格納する配列

// JSONファイルを読み込み、データを初期化する関数
async function loadExhibitionData() {
    try {
        // exhibitions.jsonファイルのパスは、実際の配置場所に合わせて変更してください
        const response = await fetch('data/exhibitions.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        allExhibitions = await response.json();
        console.log('展示データが正常に読み込まれました:', allExhibitions);

        // 読み込んだデータを元に日付をフォーマット
        formatExhibitionDates();

        return allExhibitions; // 読み込んだデータを返す
    } catch (error) {
        console.error('展示データの読み込み中にエラーが発生しました:', error);
        return []; // エラー時は空の配列を返す
    }
}

// 展示データを表示用にフォーマットする関数
function formatExhibitionDates() {
    formattedExhibitionDates = []; // リセット
    const weekchars = ["(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"];

    allExhibitions.forEach(exhibition => {
        // 日付期間を '~' または '～' または '-' で分割
        const dates = exhibition.datePeriod.split(/[~|～|-]/);
        if (dates.length === 2) {
            const [startDateStr, endDateStr] = dates;

            // 年と月日の組み合わせでDateオブジェクトを作成
            const startFullDateStr = `${exhibition.year}/${startDateStr}`;
            const endFullDateStr = `${exhibition.year}/${endDateStr}`;

            const startDateObj = new Date(startFullDateStr);
            const endDateObj = new Date(endFullDateStr);

            // 日付を「X月Y日(曜日)」形式に変換
            const formatSingleDate = (dateObj) => {
                const month = dateObj.getMonth() + 1;
                const day = dateObj.getDate();
                const dayOfWeek = weekchars[dateObj.getDay()];
                return `${month}月${day}日${dayOfWeek}`;
            };

            const formattedStart = formatSingleDate(startDateObj);
            const formattedEnd = formatSingleDate(endDateObj);

            formattedExhibitionDates.push(`${formattedStart}~${formattedEnd}`);
        } else {
            // 期間が単一の日付の場合などの処理（必要に応じて）
            formattedExhibitionDates.push(exhibition.datePeriod); // そのまま表示
        }
    });
    console.log('フォーマットされた日付:', formattedExhibitionDates);
}

// 他のスクリプトから展示データにアクセスするための関数
function getExhibitions() {
    return allExhibitions;
}

// 他のスクリプトからフォーマットされた日付にアクセスするための関数
function getFormattedExhibitionDates() {
    return formattedExhibitionDates;
}

// 初期ロード時にデータをフェッチ
loadExhibitionData(); // この関数は非同期なので、データが利用可能になるまで待つ必要がある

// グローバルスコープで利用できるようにエクスポート（または直接利用）
// SichimenMain.jsが直接これらの関数を呼び出すことを想定
window.getExhibitions = getExhibitions;
window.getFormattedExhibitionDates = getFormattedExhibitionDates;
window.loadExhibitionData = loadExhibitionData; // 外部から再読み込みしたい場合