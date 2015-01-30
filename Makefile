# grunt felt too verbose, gulp's piping felt too magical.
# Makefiles work until I have time to make sense of that shit.
# Beware building in sensitive environments, as sourcemaps include full file full paths.

BIN = ./node_modules/.bin

dev: clean
	cp -ar client web_build
	$(BIN)/browserify web_build/js/client.jsx --outfile web_build/main.js --debug --extension=.jsx -t reactify
	$(BIN)/node-sass --output-style expanded --stdout web_build/assets/main.scss > web_build/assets/main.css
	for themedir in web_build/assets/themes/*; do \
		$(BIN)/node-sass --output-style expanded --stdout "$$themedir"/main.scss > "$$themedir"/main.css; \
	done;
	rm -rf web_build/js
	rm web_build/assets/*.scss
	rm web_build/assets/themes/*/*.scss

prod: clean
	cp -ar client web_build
	$(BIN)/browserify web_build/js/client.jsx --extension=.jsx -t reactify | \
	$(BIN)/uglifyjs -c --screw-ie8 > web_build/main.js
	$(BIN)/node-sass --output-style compressed -x --stdout web_build/assets/main.scss > web_build/assets/main.css
	for themedir in web_build/assets/themes/*; do \
		$(BIN)/node-sass --output-style compressed -x --stdout "$$themedir"/main.scss > "$$themedir"/main.css; \
	done;
	rm -rf web_build/js
	rm web_build/assets/*.scss
	rm web_build/assets/themes/*/*.scss

watch_dev:
	while true; do \
		inotifywait -e close_write -r -qq ./client; \
		sleep 0.2; \
		make dev; \
		pkill node; \
		make run & \
	done;

watch_prod:
	while true; do \
		inotifywait -e close_write -r -qq ./client; \
		sleep 0.2; \
		make prod &> /dev/null; \
		pkill node; \
		make run & \
	done;

clean:
	rm -rf web_build

run:
	node server/server.js

