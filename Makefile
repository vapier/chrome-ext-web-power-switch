CLOSURE = closure-compiler --language_in ECMASCRIPT5
YUICOMPRESSOR = yuicompressor

all:

%.js.min: %.js
	$(CLOSURE) $< > $@

JS_FILES = $(shell grep '[.]js$$' manifest.files)
js-min: $(JS_FILES:=.min)

%.css.min: %.css
	$(YUICOMPRESSOR) $< > $@

CSS_FILES = $(shell grep '[.]css$$' manifest.files)
css-min: $(CSS_FILES:=.min)

check: css-min js-min

dist:
	./makedist.sh

.PHONY: all clean check css-min dist js-min
