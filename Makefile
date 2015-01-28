# grunt felt too verbose, gulp's piping felt too magical.
# Makefiles work until I have time to make sense of that shit.
# Beware building in sensitive environments, as sourcemaps include full file full paths.

BIN = ./node_modules/.bin
RESUNIQ := $(shell cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)

dev: clean
	mkdir web_build
	$(BIN)/browserify client/client.jsx --outfile web_build/bundle.$(RESUNIQ).js --debug --extension=.jsx -t reactify
	$(BIN)/node-sass --output-style expanded --stdout client/scss/main.scss > web_build/bundle.$(RESUNIQ).css
	cp client/index.html web_build
	sed -i -e s/@@RESUNIQ@@/$(RESUNIQ)/g web_build/index.html

prod: clean
	mkdir web_build
	$(BIN)/browserify client/client.jsx --extension=.jsx -t reactify | \
	$(BIN)/uglifyjs -c --screw-ie8 > web_build/bundle.$(RESUNIQ).js
	$(BIN)/node-sass --output-style compressed -x --stdout client/scss/main.scss > web_build/bundle.$(RESUNIQ).css
	cp client/index.html web_build
	sed -i -e s/@@RESUNIQ@@/$(RESUNIQ)/g web_build/index.html

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

