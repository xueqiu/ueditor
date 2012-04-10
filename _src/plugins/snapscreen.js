///import core
///commandsName  snapscreen
///commandsTitle  截屏
/**
 * 截屏插件
 */
UE.commands['snapscreen'] = {
    execCommand: function(){
        var me = this,
            editorOptions = me.options;
        
        if(!browser.ie){
                alert(editorOptions.messages.snapScreenNotIETip);
                return;
        }

        var onSuccess = function(rs){
            try{
                rs = eval("("+ rs +")");
            }catch(e){
                alert('截屏上传有误\n\n请检查editor_config.js中关于截屏的配置项\n\nsnapscreenHost 变量值 应该为屏幕截图的server端文件所在的网站地址或者ip');
                return;
            }

            if(rs.state != 'SUCCESS'){
                alert(rs.state);
                return;
            }
            me.execCommand('insertimage', {
                src: (editorOptions.snapscreenImgIsUseImagePath ? editorOptions.imagePath : '') + rs.url,
                floatStyle: editorOptions.snapscreenImgAlign,
                data_ue_src:(editorOptions.snapscreenImgIsUseImagePath ? editorOptions.imagePath : '') + rs.url
            });
        };
        var onStartUpload = function(){
            //开始截图上传
        };
        var onError = function(){
            alert(editorOptions.messages.snapScreenMsg);
        };
        try{
            var nativeObj = new ActiveXObject('Snapsie.CoSnapsie');
            nativeObj.saveSnapshot(editorOptions.snapscreenHost, editorOptions.snapscreenServerFile, editorOptions.snapscreenServerPort, onStartUpload,onSuccess,onError);
        }catch(e){
            me.snapscreenInstall.open();
        }
    },
    queryCommandState: function(){
        return this.highlight ? -1 :0;
    }
};
