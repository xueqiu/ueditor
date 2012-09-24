src = _src/editor_seajs_start.js\
	  _src/editor.js\
	  _src/core/browser.js\
	  _src/core/browser.js\
	  _src/core/utils.js\
	  _src/core/EventBase.js\
	  _src/core/dom/dom.js\
	  _src/core/dom/dtd.js\
	  _src/core/dom/domUtils.js\
	  _src/core/dom/Range.js\
	  _src/core/dom/Selection.js\
	  _src/core/Editor.js\
	  _src/plugins/fiximgclick.js\
	  _src/plugins/removeformat.js\
	  _src/plugins/font.js\
	  _src/plugins/basestyle.js\
	  _src/plugins/inserthtml.js\
	  _src/plugins/list.js\
	  _src/plugins/serialize.js\
	  _src/plugins/paste.js\
	  _src/plugins/autoheight.js\
      _src/editor_seajs_end.js

dafault: concat

concat:
	cat $(src) > ueditor.js && dos2unix ueditor.js && unix2dos ueditor.js
