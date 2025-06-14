.PHONY: start-web-app-dev
start-web-app-dev:
	cd apps/web-app && \
	npm run dev;

.PHONY: upload-mobile-preview
upload-mobile-preview:
	cd apps/mobile && \
	npm run upload-preview;

.PHONY: start-ios-dev
start-ios-dev:
	cd apps/mobile && \
	echo "Checking for ios folder..."; \
	if [ ! -d ios ]; then \
		echo "No ios folder found, running expo run:ios"; \
		npm run ios; \
	else \
		echo "iOS folder found, starting Expo in iOS simulator"; \
		npx expo start -i; \
	fi \

.PHONY: start-android-dev
start-android-dev:
	cd apps/mobile && \
	echo "Checking for android folder..."; \
	if [ ! -d android ]; then \
		echo "No android folder found, running expo run:android"; \
		npm run android; \
	else \
		echo "Android folder found, starting Expo in Android emulator"; \
		npx expo start -a; \
	fi \