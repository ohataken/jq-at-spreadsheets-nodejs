# jq @spreadsheets

```
echo '{ "results": [{ "id": 1, "name": "alice" }, { "id": 2, "name": "bob" }] }' | jq -r '.results[] | [.id, .name] | @json' | jq-at-spreadsheets updateById XXXXXXXXXXXXXXXX 'Sheet 1' A1
```
