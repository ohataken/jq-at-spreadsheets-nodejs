# jq @spreadsheets

```
echo '[1,2,3,4,5]' | jq-at-spreadsheets updateById XXXXXXXXXXXXXXXX 'Sheet 1' A1
```

```
echo '{ "results": [{ "id": 1, "name": "alice" }, { "id": 2, "name": "bob" }] }' | jq -r '.results[] | [.id, .name] | @json' | jq-at-spreadsheets updateById XXXXXXXXXXXXXXXX 'Sheet 1' A1
```

## Installation

### リポジトリを clone して、 npm install して、 npm link する。

してください。

```
git clone https://github.com/ohataken/jq-at-spreadsheets-nodejs.git
cd jq-at-spreadsheets-nodejs
npm install
npm link
```

### Google Cloud Platform で OAuth 2.0 クライアント ID を作成し、ダウンロードする。

以下のような内容のものです。これを `~/.jq_at_spreadsheets_credentials.json` に保存してください。

```
{
  "installed": {
    "client_id": "000000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.apps.googleusercontent.com",
    "project_id": "xxxxxxxx",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "XXXXXXXXXXXXXXXXXXXXXXXX",
    "redirect_uris": [
      "urn:ietf:wg:oauth:2.0:oob",
      "http://localhost"
    ]
  }
}
```

### jq-at-spreadsheets login する

実行すると URL が出力されるのでブラウザで開いてください。 OAuth2 の同意画面が開くので、内容を確認した上で許可してください。

すると localhost にリダイレクトされ、ページが表示されないはずです。このときの URL は以下のような形式のはずです。

```
http://localhost/?code=xxxxxxxxxxxxxxxx&scope=https://www.googleapis.com/auth/spreadsheets
```

この xxxxxxxxxxxxxxxx の部分をコピーして、ターミナルに貼り付けてください。ここまでで準備が整いました。
