# grunt felt too verbose, gulp's piping felt too magical.
# Makefiles work until I have time to make sense of that shit.
# Beware building in sensitive environments, as sourcemaps include full file full paths.

BIN = ./node_modules/.bin
RESUNIQ := $(shell cat /dev/urandom | tr -dc 'a-zA-Z0-9' | fold -w 8 | head -n 1)

dev: clean
	mkdir web_build
	$(BIN)/browserify client/client.jsx --outfile web_build/bundle.$(RESUNIQ).js --debug --extension=.jsx -t [ reactify --es6 ] -t ./esx6ify
	cp client/index.html web_build
	sed -i -e s/@@BUNDLEJS@@/bundle.$(RESUNIQ).js/g web_build/index.html

prod: clean
	mkdir web_build
	$(BIN)/browserify client/client.jsx --extension=.jsx -t [ reactify --es6 ] -t ./esx6ify | \
	$(BIN)/uglifyjs -c --screw-ie8 > web_build/bundle.$(RESUNIQ).js
	cp client/index.html web_build
	sed -i -e s/@@BUNDLEJS@@/bundle.$(RESUNIQ).js/g web_build/index.html

clean:
	rm -rf web_build

run:
	node server/server.js

