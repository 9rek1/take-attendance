import getZoomAttendees = require('./getZoomAttendees');
import getStudentList = require('./getStudentList');

class Student {
  present: boolean;
  zoomName: string;
  constructor(
    public studentNumber: string,
    public lastName: string,
    public firstName: string,
    public lastKana: string,
    public firstKana: string
  ) {
    this.present = false;
    this.zoomName = '';
  }
  attend(zoomName: string) {
    this.zoomName = zoomName;
    this.present = true;
  }
}

function main() {
  try {
    const zoomAttendees = getZoomAttendees();
    const students = getStudentList().map(
      ({ studentNumber, lastName, firstName, lastKana, firstKana }) =>
        new Student(studentNumber, lastName, firstName, lastKana, firstKana)
    );
    console.log('Zoom参加者は ' + zoomAttendees.length + ' 人でした');
    printResult(...takeAttendance(zoomAttendees, students));
  } catch (e) {
    console.error(`${e}`);
    return;
  }
}

function printResult(students: Student[], unidentified: string[]) {
  students.forEach(({ lastName, firstName, present, zoomName }) => {
    const status = present ? '○' : '×';
    const account = zoomName ? ` ＠${zoomName}` : '';
    console.log(`${status} ${lastName}${firstName}${account}`);
  });
  const [staff, uStudents] = divideIntoStaffAndStudents(unidentified);
  if (uStudents.length > 0) {
    console.log('\n----------');
    console.log(
      '>> 以下のZoom出席者については、どの生徒か特定できませんでした'
    );
    uStudents.forEach((zoomName) => console.log('* ' + zoomName));
  }
  console.log('\n----------');
  console.log('>> スタッフと思われるZoom出席者');
  staff.forEach((zoomName) => console.log('* ' + zoomName));
}

/**
 * Zoom出席者一覧を使って出席簿をつける
 * @param zoomAttendees Zoom出席者一覧
 * @param students 出席簿
 * @returns [出席簿、誰なのか特定できなかったZoom表示名のリスト]
 */
function takeAttendance(
  zoomAttendees: string[],
  students: Student[]
): [Student[], string[]] {
  const unidentified: string[] = [];
  zoomAttendees.forEach((zoomName) => {
    const index = identify(zoomName, students);
    if (index < 0) unidentified.push(zoomName);
    else students[index].attend(zoomName);
  });
  return [students, unidentified];
}

/**
 * 渡されたZoom表示名がどの生徒のものか特定し、その生徒の出席番号（インデックス）を返す
 * @param zoomName Zoomの表示名
 * @param students 出席簿
 * @returns 出席番号（特定できなかった場合は-1）
 */
function identify(zoomName: string, students: Student[]) {
  return students.findIndex(
    ({ present, studentNumber, lastName, firstName, lastKana, firstKana }) => {
      if (present) return false;
      if (
        includesAll(zoomName, [lastName, firstName]) ||
        includesAll(zoomName.toUpperCase(), [studentNumber]) ||
        includesAll(zoomName, [lastKana, firstKana]) ||
        includesAll(zoomName, [kanaToHira(lastKana), kanaToHira(firstKana)])
      ) {
        return true;
      }
      return false;
    }
  );
}

function includesAll(s: string, searchList: string[]) {
  return searchList.every((searchStr) => s.includes(searchStr));
}

/**
 * 渡された文字列の、カタカナ部分をひらがなにする
 * @param s 文字列
 * @returns 置き換え後の文字列
 */
function kanaToHira(s: string): string {
  return s.replace(/[\u30A1-\u30FA]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0x60);
  });
}

/**
 * Zoom表示名のリストを、スタッフと思われるものとそうでないものに分けて返す
 * @param unidentified 未特定のZoom表示名のリスト
 * @returns [スタッフと思われるもの、そうでないもの]
 */
function divideIntoStaffAndStudents(
  unidentified: string[]
): [string[], string[]] {
  const staff: string[] = [];
  const students: string[] = [];
  unidentified.forEach((zoomName) => {
    if (
      zoomName.includes('TA') ||
      zoomName.includes('担任') ||
      zoomName.includes('職員') ||
      zoomName.includes('Staff')
    ) {
      staff.push(zoomName);
    } else {
      students.push(zoomName);
    }
  });
  return [staff, students];
}
