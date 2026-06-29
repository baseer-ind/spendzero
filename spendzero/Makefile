.PHONY: dev dev-android dev-ios stop lan-ip setup-mobile android ios apk aab ios-archive test-backend test-mobile

## One-command local stack (Postgres, Redis, migrate, seed, backend). Add ANDROID=1 or IOS=1 to also launch Flutter.
dev:
	./scripts/dev.sh

dev-android:
	./scripts/dev.sh --android

dev-ios:
	./scripts/dev.sh --ios

## Stop the backend + Postgres/Redis containers started by `make dev`.
stop:
	./scripts/stop.sh

## Print this machine's LAN IP, for connecting a physical phone manually.
lan-ip:
	./scripts/lan_ip.sh

## One-time: scaffold mobile/android and mobile/ios via `flutter create`.
setup-mobile:
	./scripts/setup_mobile_platforms.sh

## Run on a connected Android device/emulator (backend must already be running — see `make dev`).
android:
	./scripts/run_mobile.sh android

## Run on a connected iOS simulator/device (backend must already be running — see `make dev`).
ios:
	./scripts/run_mobile.sh ios

## Build a release APK (ENV=development|staging|production, default production).
apk:
	./scripts/build_release.sh apk $(ENV)

## Build a release Android App Bundle (ENV=development|staging|production, default production).
aab:
	./scripts/build_release.sh appbundle $(ENV)

## Build an iOS archive/IPA (macOS + Xcode only; ENV=development|staging|production).
ios-archive:
	./scripts/build_release.sh ios-archive $(ENV)

test-backend:
	cd backend && . .venv/bin/activate && pytest -q

test-mobile:
	cd mobile && flutter test
