interface ColIndexes {
  teacherName: number;
  studentNumber: number;
  lastName: number;
  firstName: number;
  lastKana: number;
  firstKana: number;
}

interface TmpSt {
  studentNumber: string;
  lastName: string;
  firstName: string;
  lastKana: string;
  firstKana: string;
}

function getStudentList(): TmpSt[] {
  const stSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  const [colIndexes, hdRowIndex] = getIndexes(stSheet);
  const teacherArray = stSheet
    .getRange(
      hdRowIndex + 1,
      colIndexes.teacherName,
      stSheet.getLastRow() - hdRowIndex + 1,
      1
    )
    .getValues();
  const TEACHER_NAME = identifyTeacher(teacherArray);
  const stRowIndexes: number[] = []; // 担任がTEACHER_NAMEである生徒のインデックスリスト
  teacherArray.forEach(([value], i) => {
    if (value === TEACHER_NAME) stRowIndexes.push(i + hdRowIndex + 1); // +1はSheetのインデックス
  });
  const studentList = stRowIndexes.map((rowIndex) => {
    const { teacherName, ...cur } = colIndexes;
    const tmpObj: TmpSt = {
      studentNumber: '',
      lastName: '',
      firstName: '',
      lastKana: '',
      firstKana: '',
    };
    Object.entries(cur).forEach(([key, value]) => {
      const sheetVal = stSheet.getRange(rowIndex, value).getValue();
      if (typeof sheetVal !== 'string') {
        throw new Error(`${rowIndex}行目${value}列目の値が不適切です`);
      }
      tmpObj[key as keyof TmpSt] = sheetVal;
    });
    return tmpObj;
  });
  return studentList;
}

function getIndexes(
  stSheet: GoogleAppsScript.Spreadsheet.Sheet
): [ColIndexes, number] {
  const hdRowIndex = getHdRowIndex(stSheet);
  if (hdRowIndex <= 0) throw new Error('ヘッダー行が見つかりませんでした');
  const colIndexes = {
    teacherName: -1,
    studentNumber: -1,
    lastName: -1,
    firstName: -1,
    lastKana: -1,
    firstKana: -1,
  };
  // 20列も見ておけば「学籍番号」から「メイ」まで含まれるかが判断できると想定
  const [hdRowVals] = stSheet.getRange(hdRowIndex, 1, 1, 20).getValues();
  hdRowVals.forEach((value, i) => {
    i += 1; // Sheetのインデックスは1から始まる
    if (value === '学籍番号') colIndexes.studentNumber = i;
    if (value === 'オン通担任') colIndexes.teacherName = i;
    if (value === '姓') colIndexes.lastName = i;
    if (value === '名') colIndexes.firstName = i;
    if (value === 'セイ') colIndexes.lastKana = i;
    if (value === 'メイ') colIndexes.firstKana = i;
  });
  for (const [key, value] of Object.entries(colIndexes)) {
    if (value <= 0) throw new Error(`${key}が見つかりませんでした`);
  }
  return [colIndexes, hdRowIndex];
}

function getHdRowIndex(stSheet: GoogleAppsScript.Spreadsheet.Sheet) {
  for (let i = 1; i <= stSheet.getLastRow(); i++) {
    const cur = stSheet.getRange(i, 1).getValue();
    if (cur === '出願番号' || cur === '学籍番号') return i;
  }
  return -1;
}

/**
 * ダイアログを出して、出席を取るクラスを判断する
 * @param teacherArray 各生徒の担任リスト
 * @returns 出席を取るクラスの担任の名前
 */
function identifyTeacher(teacherArray: string[][]) {
  const teachers = Array.from(new Set(teacherArray.flat()));
  for (const value of teachers) {
    const ui = SpreadsheetApp.getUi();
    const res = ui.alert(`${value}先生クラスですか？`, ui.ButtonSet.YES_NO);
    if (res === ui.Button.YES) return value;
  }
  throw new Error('担任の先生を選んでください');
}

export = getStudentList;
