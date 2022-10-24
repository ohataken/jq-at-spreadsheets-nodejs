# jq @spreadsheets

```
cat xxx.json | jq -r '.[] | [.id] | @json' | jq-at-spreadsheets https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXX/edit
```
