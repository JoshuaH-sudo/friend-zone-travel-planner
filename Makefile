.PHONY: upload-mobile-preview
upload-mobile-preview:
	cd apps/mobile && \
	npm run upload-preview;

.PHONY: start-ios-dev
start-ios-dev:
	cd apps/mobile && \
	npm run ios;

.PHONY: start-ios-dev
start-ios-dev:
	cd apps/mobile && \
	npm run ios;