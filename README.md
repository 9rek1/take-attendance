# take-attendance

## .clasp.json について

- プロジェクトルートに置いている
- 現状は、ts を直接 `clasp push` している

```json
{
  "scriptId": "Lorem ipsum dolor sit amet, consectetur adipiscing elit",
  "rootDir": "src/",
  "fileExtensiion": "ts",
  "filePushOrder": ["getZoomAttendees.ts", "getStudentList.ts", "main.ts"]
}
```

## types/dayjs.d.ts について

[こちらのファイル](https://github.com/m-haketa/gas_dayjs_usertest/blob/master/%40types/dayjs.d.ts)を使わせていただいています
