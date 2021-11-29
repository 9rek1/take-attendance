function getZoomAttendees() {
  dayjs.dayjs.locale('ja');
  const today = dayjs.dayjs().format('M/D(dd)');
  // const today = '9/1(水)';
  const zmSheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[1];
  const [days] = zmSheet.getRange(1, 1, 1, zmSheet.getLastColumn()).getValues();
  const todayColIndex = days.findIndex((day) => {
    day = dayjs.dayjs(day).format('M/D(dd)');
    return day === today;
  });
  if (todayColIndex <= 0) {
    throw new Error(today + 'の列が見つかりませんでした');
  }
  const targetColIndex = todayColIndex + 1; // 1限目
  // チャット貼り付けは3行目から
  const zoomAttendees = zmSheet
    .getRange(3, targetColIndex, zmSheet.getLastRow(), 1)
    .getValues()
    .map(([value]) => value)
    .filter((value) => value !== '');
  if (zoomAttendees.length <= 0) {
    throw new Error('チャットが貼り付けられていません');
  }
  return zoomAttendees;
}

export = getZoomAttendees;
