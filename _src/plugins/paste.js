///import core
///import plugins/inserthtml.js
///import plugins/undo.js
///import plugins/serialize.js
///commands 粘贴
///commandsName  PastePlain
///commandsTitle  纯文本粘贴模式
/*
 ** @description 粘贴
 * @author zhanyi
 */
(function() {
    var browser = UE.browser
    var pasteFilter = UE.pasteFilter = function(html, editor) {
        var f = editor.serialize;
        var word_img_flag = editor.paste_options.word_img_flag
        var modify_num = editor.paste_options.modify_num
        var pasteplain = editor.options.pasteplain
        if(f){
            //如果过滤出现问题，捕获它，直接插入内容，避免出现错误导致粘贴整个失败
            try{
                var node =  f.transformInput(
                            f.parseHTML(
                                //todo: 暂时不走dtd的过滤
                                f.word(html)//, true
                            ),word_img_flag
                        );
                //trace:924
                //纯文本模式也要保留段落
                node = f.filter(node,pasteplain ? {
                    whiteList: {
                        'p': {'br':1,'BR':1},
                        'br':{'$':{}},
                        'div':{'br':1,'BR':1,'$':{}},
                        'li':{'$':{}},
                        'img':{'$':{'height':1,'width':1,'src':1,'class':1}},
                        'span':{'$':{'style':1}},
                        'strong':{'span':1}
                    },
                    blackList: {
                        'style':1,
                        'script':1,
                        'object':1
                    }
                } : null, !pasteplain ? modify_num : null);

                if(browser.webkit){
                    var length = node.children.length,
                        child;
                    while((child = node.children[length-1]) && child.tag == 'br'){
                        node.children.splice(length-1,1);
                        length = node.children.length;
                    }
                }
                html = f.toHTML(node,pasteplain)

            }catch(e){}
        }
        return html;
    };
    function getClipboardData( callback ) {

        var doc = this.document;

        if ( doc.getElementById( 'baidu_pastebin' ) ) {
            return;
        }

        var range = this.selection.getRange(),
            bk = range.createBookmark(),
            //创建剪贴的容器div
            pastebin = doc.createElement( 'div' );

        pastebin.id = 'baidu_pastebin';


        // Safari 要求div必须有内容，才能粘贴内容进来
        browser.webkit && pastebin.appendChild( doc.createTextNode( domUtils.fillChar + domUtils.fillChar ) );
        doc.body.appendChild( pastebin );
        //trace:717 隐藏的span不能得到top
        //bk.start.innerHTML = '&nbsp;';
        bk.start.style.display = '';
        pastebin.style.cssText = "position:absolute;width:1px;height:1px;overflow:hidden;left:-1000px;white-space:nowrap;top:" +
            //要在现在光标平行的位置加入，否则会出现跳动的问题
            domUtils.getXY( bk.start ).y + 'px';

        range.selectNodeContents( pastebin ).select( true );

        setTimeout( function() {
            
            if (browser.webkit) {
                
                for(var i=0,pastebins = doc.querySelectorAll('#baidu_pastebin'),pi;pi=pastebins[i++];){
                    if(domUtils.isEmptyNode(pi)){
                        domUtils.remove(pi)
                    }else{
                        pastebin = pi;
                        break;
                    }
                }


            }

			try{
                pastebin.parentNode.removeChild(pastebin);
            }catch(e){}

            range.moveToBookmark( bk ).select(true);
            callback( pastebin );
        }, 0 );


    }

    UE.plugins['paste'] = function() {
        var me = this;
        var po = me.paste_options = {}
        var word_img_flag = po.word_img_flag = {flag:""};

        var pasteplain = me.options.pasteplain === true;
        var modify_num = po.modify_num = {flag:""};
        me.commands['pasteplain'] = {
            queryCommandState: function (){
                return pasteplain;
            },
            execCommand: function (){
                pasteplain = !pasteplain|0;
            },
            notNeedUndo : 1
        };

        function filter(div){
            
            var html;
            if ( div.firstChild ) {
                    //去掉cut中添加的边界值
                    var nodes = domUtils.getElementsByTagName(div,'span');
                    for(var i=0,ni;ni=nodes[i++];){
                        if(ni.id == '_baidu_cut_start' || ni.id == '_baidu_cut_end'){
                            domUtils.remove(ni)
                        }
                    }

                    if(browser.webkit){

                        var brs = div.querySelectorAll('div br');
                        for(var i=0,bi;bi=brs[i++];){
                            var pN = bi.parentNode;
                            if(pN.tagName == 'DIV' && pN.childNodes.length ==1){
                                pN.innerHTML = '<p><br/></p>';
                                
                                domUtils.remove(pN)
                            }
                        }
                        var divs = div.querySelectorAll('#baidu_pastebin');
                        for(var i=0,di;di=divs[i++];){
                            var tmpP = me.document.createElement('p');
                            di.parentNode.insertBefore(tmpP,di);
                            while(di.firstChild){
                                tmpP.appendChild(di.firstChild)
                            }
                            domUtils.remove(di)
                        }



                        var metas = div.querySelectorAll('meta');
                        for(var i=0,ci;ci=metas[i++];){
                            domUtils.remove(ci);
                        }

                        var brs = div.querySelectorAll('br');
                        for(i=0;ci=brs[i++];){
                            if(/^apple-/.test(ci)){
                                domUtils.remove(ci)
                            }
                        }

                    }
                    if(browser.gecko){
                        var dirtyNodes = div.querySelectorAll('[_moz_dirty]')
                        for(i=0;ci=dirtyNodes[i++];){
                            ci.removeAttribute( '_moz_dirty' )
                        }
                    }
                    if(!browser.ie ){
                        var spans = div.querySelectorAll('span.apple-style-span');
                        for(var i=0,ci;ci=spans[i++];){
                            domUtils.remove(ci,true);
                        }
                    }


                    html = div.innerHTML;
                    if (SNB && SNB.Util && 'function' == typeof SNB.Util.parseContent) {
                      html = SNB.Util.parseContent(html, true)
                    }

                    html = pasteFilter(html, me)

                    //自定义的处理
                   html = {'html':html};

                   me.fireEvent('beforepaste',html);
                    //不用在走过滤了
                   me.execCommand( 'insertHtml',html.html,true);

	               me.fireEvent("afterpaste");

                }
        }

        me.addListener('ready',function(){
            domUtils.on(me.body,'cut',function(){

                var range = me.selection.getRange();
                if(!range.collapsed && me.undoManger){
                    me.undoManger.save()
                }
       
            });
            //ie下beforepaste在点击右键时也会触发，所以用监控键盘才处理
                domUtils.on(me.body, browser.ie ? 'keydown' : 'paste',function(e){
                    if (browser.ie) {
                      if (!e.ctrlKey || e.keyCode != '86') {
                        return;
                      } else {
                        iebk.ctrlv = true
                      }
                    }
                    getClipboardData.call( me, function( div ) {
                        filter(div);
                    } );


                })

            var iebk = {}
            , ierange
            , startId = '___ie_paste_start___'
            , bookmarkStart = function() {
                var startNode = me.document.getElementById(startId) // 光标的开始点
                if (startNode) {
                  domUtils.remove(startNode)
                } else {
                  startNode = me.document.createElement('span')
                  startNode.id = startId
                }
                ierange = me.selection.getRange()
                var _bk = ierange.createBookmark()
                ierange.setStartBefore(_bk.start)
                // 未选中文字时，IE 粘贴入文字会把前面的空标签清除，这样
                // startNode 在粘贴后会消失，需要将 startNode 设置到当前标签外层
                while ( ierange.startOffset == 0 ) {
                    if ( domUtils.isBody( ierange.startContainer ) )break;
                    ierange.setStartBefore( ierange.startContainer );
                }
                ierange.insertNode(startNode) // 将 startNode 设置到当前标签外层
                ierange.moveToBookmark(_bk) // 再把光标设置回来
                if (!ierange.collapsed) ierange.select(true)
                iebk.start = startNode
              }
            , removeBookmarkStart = function() {
                var startNode = me.document.getElementById(startId)
                if (startNode) {
                  domUtils.remove(startNode)
                }
              }
            if (browser.ie ) {
              domUtils.on(me.body, 'contextmenu', bookmarkStart)
              domUtils.on(me.body, 'click', removeBookmarkStart)
              domUtils.on(me.window, 'blur', removeBookmarkStart)
              domUtils.on(me.body, 'paste', function(ev){
                if (iebk.ctrlv) {
                  delete iebk.ctrlv
                  return
                }
                setTimeout(function() {
                  iebk.start = me.document.getElementById(startId)
                  if (!iebk.start) {
                    return
                  }
                  var div = me.document.createElement( 'div' )
                  , range = me.selection.getRange()
                  iebk.end = range.createBookmark().start
                  range.moveToBookmark( iebk )
                  range.enlarge()
                  div.appendChild(range.extractContents())
                  filter(div)
                }, 0)
              })
            }

        });

    }

})();

