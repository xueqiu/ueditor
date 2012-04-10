///import core
///commandsName  catchRemoteImage
/**
 * 远程图片抓取,当开启本插件时所有不符合本地域名的图片都将被抓取成为本地服务器上的图片
 *
 */
UE.plugins['catchremoteimage'] = function (){
    if(!this.options.catchRemoteImageEnable)return;
    var ajax = UE.ajax,
		me = this,
		localDomain = me.options.localDomain,
		catcherUrl = me.options.catcherUrl,
	    separater="ue_separate_ue";

    function catchremoteimage(imgs,callbacks) {
        var submitStr = imgs.join(separater);
        ajax.request( catcherUrl, {
            content:submitStr,
            timeout:60000,  //单位：毫秒，回调请求超时设置。目标用户如果网速不是很快的话此处建议设置一个较大的数值
            onsuccess:callbacks["success"],
            onerror:callbacks["error"]
        } )

    }
    me.addListener("afterpaste",function(){
        me.fireEvent("catchRemoteImage");
    });

    me.addListener( "catchRemoteImage", function () {
        var remoteImages=[];
        var imgs = domUtils.getElementsByTagName(me.document,"img");
        for(var i = 0,ci;ci=imgs[i++];){
	        if(ci.getAttribute("word_img"))continue;
            var src = ci.getAttribute("data_ue_src") || ci.src||"";
	        if(/^(https?|ftp):/i.test(src) && src.indexOf(localDomain)==-1 ) {
                remoteImages.push(src);
            }
        }
        if(remoteImages.length){
            catchremoteimage(remoteImages,{
                //成功抓取
                success:function (xhr){
                    try{
                        var info = eval("("+xhr.responseText+")");
                    }catch(e){
                        return;
                    }
                    var srcUrls = info.srcUrl.split(separater),
                        urls = info.url.split(separater);
                    for(var i=0,ci;ci=imgs[i++];){
                        var src = ci.getAttribute("data_ue_src")||ci.src||"";
                        for(var j=0,cj;cj=srcUrls[j++];){
                            var url = urls[j-1];
                            if(src == cj && url!="error"){  //抓取失败时不做替换处理
	                            //地址修正
                                var newSrc = me.options.UEDITOR_HOME_URL +"server/"+url;
                                domUtils.setAttributes(ci,{
                                    "src":newSrc,
                                    "data_ue_src":newSrc
                                });
                                break;
                            }
                        }
                    }
                },
                //回调失败，本次请求超时
                error:function(){
                    me.fireEvent("catchremoteerror");
                }
            })
        }

    } )
};