///import core
///commands 修复chrome下图片不能点击的问题
///commandsName  FixImgClick
///commandsTitle  修复chrome下图片不能点击的问题
//修复chrome下图片不能点击的问题
//
//雪球hack by yuest
//不可改大小
//插入图片时根据浏览器判断在 img 上加如下 attribute
/*
if ($.browser.webkit) {
  editable = ''
} else if ($.browser.mozilla) {
  editable = 'contenteditable="false"'
} else if ($.browser.msie) {
  if (parseInt($.browser.version, 10) < 9)
    editable = ''
  else
    editable = 'unselectable="on"'
}
*/
UE.plugins['fiximgclick'] = function() {
    var me = this;
    if ( browser.webkit ) {
        me.addListener( 'click', function( type, e ) {
            if ( e.target.tagName == 'IMG' ) {
                var range = new dom.Range( me.document );
                range.selectNode( e.target ).select();

            }
        } )
    } else {
      var insert = function (img) {
          var range = new dom.Range(me.document)
          range
            .selectNode(img)
            .collapse(true)
            .insertNode(me.document.createTextNode('\u200B'))
        }
      , select = function (img) {
          var range = new dom.Range(me.document)
          range
            .selectNode(img)
            .setStart(range.startContainer, range.startOffset - 1)
            .select()
        }
      , getCharBefore = function (img) {
          var range = new dom.Range(me.document)
          range
            .selectNode(img)
            .collapse(true)
            .setStart(range.startContainer, range.startOffset - 1)
          var fc = range.cloneContents().firstChild
          return fc ? fc.textContent || fc.innerText : null
        }
      , selectImg = function (img) {
          var range = me.selection.getRange()
          if (!range.startOffset) {
            insert(img)
            select(img)
          } else {
            if ('\u200B' === getCharBefore(img)) {
              select(img)
            } else {
              insert(img)
              select(img)
            }
          }
        }
      me.addListener('click', function(type, e) {
        if ( e.target && e.target.tagName == 'IMG' ) {
          selectImg(e.target)
        }
      })
      me.addListener("selectionchange", function() {
        var range = me.selection.getRange()
        if (range.endOffset - range.startOffset === 1) {
          if (range.startContainer.nodeType === 1) {
            var selElm = range.startContainer.childNodes[range.startOffset]
            if (selElm.tagName === 'IMG') {
              selectImg(selElm)
              return
            }
          }
        }
      })
    }
};
