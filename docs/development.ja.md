開発環境手順
================================================================

## 動かす方法

NODE_ENVが設定不要な以外はほぼsetup手順と同じです

依存パッケージをインストールしてconfigを設定してから
```
pnpm install
pnpm build
pnpm start
```

## コードを変更した後に変更を確認する方法

バージョンを変更する必要がありますが、developmentの場合は自動的にバージョンが設定されます。  

## 変更したコードを公開インスタンスで動かす場合

`package.json`の`version`を変更する必要があります。

ソースコードの公開URLは、[src/const.json](../src/const.json) の `repositoryUrl` に設定することが出来ます。  

### ローカルでテストを動かす方法
```
cp test/test.yml .config/
```

```
docker-compose -f test/docker-compose.yml up
```
でテスト用のDBとRedisを上げる。
または、空の (データが消去されてもいい) DBを準備して`.config/test.yml`を調整する。

```
pnpm test
```

※ build後に実行する必要があります

### API endpointを追加削除したら

以下のコマンドでインデックスを更新する必要があります。

```
npx ts-node --swc src/tools/dev/gen-api-endpoints.ts
```
