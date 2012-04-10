///import core
///import plugins\inserthtml.js
///commands 插入框架
///commandsName  InsertFrame
///commandsTitle  插入Iframe
///commandsDialog  dialogs\insertframe\insertframe.html

UE.commands['insertframe'] = {
     queryCommandState : function(){
        return this.highlight ? -1 :0;
    }
};

