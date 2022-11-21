# Dockerで開発する方法

## インストール

このガイドはMisskeyをDocker環境を使用して開発する方法を案内します。

もしDocker環境を使用せずに開発したい場合は別ガイドを参照してください。

## システム準備

* dockerとdocker-composeをインストールしてください。
  * [Docker](https://docs.docker.com/engine/install/)
  * [Docker-compose](https://docs.docker.com/compose/install/)

* このリポジトリをクローンしてください。
  * `git clone https://github.com/atsu1125/misskey.git`
  * `cd misskey`

## 基本的な設定

```bash
cp .config/docker.yml .config/default.yml
```

たぶん変更しなくても動きますが、もし特定の環境設定を行いたい場合には変更してください。

## コンテナのビルド

```bash
./dockerbuild.sh
```

これはMisskeyの開発に必要な環境をビルドします。Misskeyをビルドしません。一度だけ必要です。

## Misskeyのビルド

```bash
./dockermanage.sh yarn install
./dockermanage.sh yarn build
```

Misskey本体をビルドします。変更を加えるたびに必要です。

## Misskeyの起動

```bash
docker-compose -f docker-compose-split.yml up
```

Misskeyとその依存関係のRedisとMongoDBを起動します。
