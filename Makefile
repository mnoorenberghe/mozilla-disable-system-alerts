# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

BUILD_DIR=build
XPI=disable-system-alerts.xpi

help:
	@echo "Make targets:"
	@echo "  package	Builds the extension."
	@echo "  clean		Cleans the build directory"
	@echo "\nExample: 	make package"


package:
	@echo "Packaging"

	mkdir -p "$(BUILD_DIR)"
	rsync -am --include='*.js' --include '*.jsm' --include='*.json' --include='*.css' --include='*.exe' --include='*.xul' --include='*.png' --include='*.manifest' --include='*.properties' --include='*.rdf' --include='*.xml' --exclude "build" -f 'hide,! */' . "$(BUILD_DIR)"

# 	Clean up unwanted files
	find "$(BUILD_DIR)" -depth -name '*~' -exec rm -rf "{}" \;
	find "$(BUILD_DIR)" -depth -name '#*' -exec rm -rf "{}" \;
	find "$(BUILD_DIR)" -depth -name '.DS_Store' -exec rm "{}" \;
	find "$(BUILD_DIR)" -depth -name 'Thumbs.db' -exec rm "{}" \;

# 	Create the XPI
	rm -f "$(XPI)"
	cd $(BUILD_DIR) && zip -qr9XD "../$(XPI)" * && cd ../..
	@echo "Done: $(BUILD_DIR)/$(XPI)"

clean:
	rm -Rf "$(BUILD_DIR)"
	rm -f "$(BUILD_DIR)/$(XPI)"
