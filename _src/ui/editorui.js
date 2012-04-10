(function (){
    var isIE = baidu.editor.browser.ie;
    var utils = baidu.editor.utils;
    var editorui = baidu.editor.ui;
    var _Dialog = editorui.Dialog;
    editorui.Dialog = function (options){
        var dialog = new _Dialog(options);
        dialog.addListener('hide', function (){
            if (dialog.editor) {
                var editor = dialog.editor;
                try {
                    editor.focus()
                } catch(ex){}
            }
        });
        return dialog;
    };

    var k, cmd;

    var btnCmds = ['Undo', 'Redo','FormatMatch',
        'Bold', 'Italic', 'Underline',
        'StrikeThrough', 'Subscript', 'Superscript','Source','Indent','Outdent',
        'BlockQuote','PastePlain','PageBreak',
        'SelectAll', 'Print', 'Preview', 'Horizontal', 'RemoveFormat','Time','Date','Unlink',
        'InsertParagraphBeforeTable','InsertRow','InsertCol','MergeRight','MergeDown','DeleteRow',
        'DeleteCol','SplittoRows','SplittoCols','SplittoCells','MergeCells','DeleteTable'];
    k = btnCmds.length;
    while (k --) {
        cmd = btnCmds[k];
        editorui[cmd] = function (cmd){
            return function (editor, title){
                title = title || editor.options.labelMap[cmd.toLowerCase()] || '';
                var ui = new editorui.Button({
                    className: 'edui-for-' + cmd.toLowerCase(),
                    title: title,
                    onclick: function (){
                        editor.execCommand(cmd);
                    },
                    showText: false
                });
                editor.addListener('selectionchange', function (type, causeByUi, uiReady){
                    var state = editor.queryCommandState(cmd.toLowerCase());
                    if (state == -1) {
                        ui.setDisabled(true);
                        ui.setChecked(false);
                    } else {
                        
                        if(!uiReady){
                            ui.setDisabled(false);
                            ui.setChecked(state);
                        }

                    }
                });
                return ui;
            };
        }(cmd);
    }
    editorui.SnapScreen = function(editor, title){
        var cmd = "SnapScreen";
        title = title || editor.options.labelMap[cmd.toLowerCase()] || '';
        var ui = new editorui.Button({
            className: 'edui-for-' + cmd.toLowerCase(),
            title: title,
            onclick: function (){
                editor.execCommand(cmd);
            }
        });

        if(isIE){
            var iframeUrl = editor.options.iframeUrlMap['snapscreen'];
            iframeUrl = editor.ui.mapUrl(iframeUrl);
            title = title || editor.options.labelMap['snapscreen'] || '';
            var dialog = new editorui.Dialog({
                iframeUrl: iframeUrl,
                autoReset: true,
                draggable: true,
                editor: editor,
                className: 'edui-for-snapscreen',
                title: title,
                buttons: [{
                    className: 'edui-okbutton',
                    label: '确认',
                    onclick: function (){
                        dialog.close(true);
                    }
                }, {
                    className: 'edui-cancelbutton',
                    label: '取消',
                    onclick: function (){
                        dialog.close(false);
                    }
                }],
                onok: function (){},
                oncancel: function (){},
                onclose: function (t, ok){
                    if (ok) {
                        return this.onok();
                    } else {
                        return this.oncancel();
                    }
                }
            });
            dialog.render();
            editor.snapscreenInstall = dialog;
        }
        editor.addListener('selectionchange',function(){
            var state = editor.queryCommandState('snapscreen');
            ui.setDisabled(state == -1);
        });
        return ui;
    };
    editorui.ClearDoc = function(editor, title){
        var cmd = "ClearDoc";
        title = title || editor.options.labelMap[cmd.toLowerCase()] || '';
        var ui = new editorui.Button({
            className: 'edui-for-' + cmd.toLowerCase(),
            title: title,
            onclick: function (){
                if(confirm('确定清空文档吗？')){
                    editor.execCommand('cleardoc');
                }
            }
        });
        editor.addListener('selectionchange',function(){
            var state = editor.queryCommandState('cleardoc');
            ui.setDisabled(state == -1);
        });
        return ui;
    };

    editorui.Justify = function (editor, side, title){
        side = (side || 'left').toLowerCase();
        title = title || editor.options.labelMap['justify'+side.toLowerCase()] || '';
        var ui = new editorui.Button({
            className: 'edui-for-justify' + side.toLowerCase(),
            title: title,
            onclick: function (){
                editor.execCommand('Justify', side);
            }
        });
        editor.addListener('selectionchange', function (type, causeByUi, uiReady){
            var state = editor.queryCommandState('Justify');
            ui.setDisabled(state == -1);
            var value = editor.queryCommandValue('Justify');
            ui.setChecked(value == side && !uiReady);
        });
        return ui;
    };
    editorui.JustifyLeft = function (editor, title){
        return editorui.Justify(editor, 'left', title);
    };
    editorui.JustifyCenter = function (editor, title){
        return editorui.Justify(editor, 'center', title);
    };
    editorui.JustifyRight = function (editor, title){
        return editorui.Justify(editor, 'right', title);
    };
    editorui.JustifyJustify = function (editor, title){
        return editorui.Justify(editor, 'justify', title);
    };
    editorui.ImageFloat = function(editor,side,title){
        side = (side || 'none').toLowerCase();
        title = title || editor.options.labelMap['image'+side.toLowerCase()] || '';
        var ui = new editorui.Button({
            className: 'edui-for-image' + side.toLowerCase(),
            title: title,
            onclick: function (){
                editor.execCommand('imagefloat', side);
            }
        });
        editor.addListener('selectionchange', function (type){
            var state = editor.queryCommandState('imagefloat');
            ui.setDisabled(state == -1);
            var state = editor.queryCommandValue('imagefloat');
            ui.setChecked(state == side);
        });
        return ui;
    };
    editorui.ImageNone = function(editor,title){
        return editorui.ImageFloat(editor, title);
    };
    editorui.ImageLeft = function(editor,title){
        return editorui.ImageFloat(editor,"left", title);
    };
    editorui.ImageRight = function(editor,title){
        return editorui.ImageFloat(editor,"right", title);
    };
    editorui.ImageCenter = function(editor,title){
        return editorui.ImageFloat(editor,"center", title);
    };

    editorui.Directionality = function (editor, side, title){
        side = (side || 'left').toLowerCase();
        title = title || editor.options.labelMap['directionality'+side.toLowerCase()] || '';
        var ui = new editorui.Button({
            className: 'edui-for-directionality' + side.toLowerCase(),
            title: title,
            onclick: function (){
                editor.execCommand('directionality', side);
            },
            type : side
        });
        editor.addListener('selectionchange', function (type, causeByUi, uiReady){
            var state = editor.queryCommandState('directionality');
            ui.setDisabled(state == -1);
            var value = editor.queryCommandValue('directionality');
            ui.setChecked(value == ui.type && !uiReady);
        });
        return ui;
    };
    editorui.DirectionalityLtr = function (editor, title){
        return new editorui.Directionality(editor, 'ltr', title);
    };
    editorui.DirectionalityRtl = function (editor, title){
        return new editorui.Directionality(editor, 'rtl', title);
    };
    var colorCmds = ['BackColor', 'ForeColor'];
    k = colorCmds.length;
    while (k --) {
        cmd = colorCmds[k];
        editorui[cmd] = function (cmd){
            return function (editor, title){
                title = title || editor.options.labelMap[cmd.toLowerCase()] || '';
                var ui = new editorui.ColorButton({
                    className: 'edui-for-' + cmd.toLowerCase(),
                    color: 'default',
                    title: title,
                    editor:editor,
                    onpickcolor: function (t, color){
                        editor.execCommand(cmd, color);
                    },
                    onpicknocolor: function (){
                        editor.execCommand(cmd, 'default');
                        this.setColor('transparent');
                        this.color = 'default';
                    },
                    onbuttonclick: function (){
                        editor.execCommand(cmd, this.color);
                    }
                });
                editor.addListener('selectionchange', function (){
                    var state = editor.queryCommandState(cmd);
                    if (state == -1) {
                        ui.setDisabled(true);
                    } else {
                        ui.setDisabled(false);
                    }
                });
                return ui;
            };
        }(cmd);
    }

    //不需要确定取消按钮的dialog
    var dialogNoButton = ['SearchReplace','Help','Spechars'];
    k = dialogNoButton.length;
    while(k --){
        cmd = dialogNoButton[k];
        editorui[cmd] = function (cmd){
            cmd = cmd.toLowerCase();
            return function (editor, iframeUrl, title){
                iframeUrl = iframeUrl || editor.options.iframeUrlMap[cmd.toLowerCase()] || 'about:blank';
                iframeUrl = editor.ui.mapUrl(iframeUrl);
                title = title || editor.options.labelMap[cmd.toLowerCase()] || '';
                var dialog = new editorui.Dialog({
                    iframeUrl: iframeUrl,
                    autoReset: true,
                    draggable: true,
                    editor: editor,
                    className: 'edui-for-' + cmd,
                    title: title,
                    onok: function (){},
                    oncancel: function (){},
                    onclose: function (t, ok){
                        if (ok) {
                            return this.onok();
                        } else {
                            return this.oncancel();
                        }
                    }
                });
                dialog.render();
                var ui = new editorui.Button({
                    className: 'edui-for-' + cmd,
                    title: title,
                    onclick: function (){
                        dialog.open();
                    }
                });
                editor.addListener('selectionchange', function (){
                    var state = editor.queryCommandState(cmd);
                    if (state == -1) {
                        ui.setDisabled(true);
                    } else {
                        ui.setDisabled(false);
                    }
                });
                return ui;
            };
        }(cmd);
    }

    var dialogCmds = ['Attachment','Anchor','Link', 'InsertImage', 'Map', 'GMap', 'InsertVideo','TableSuper','HighlightCode','InsertFrame','EditTd'];
    
    k = dialogCmds.length;
    while (k --) {
        cmd = dialogCmds[k];
        editorui[cmd] = function (cmd){
            cmd = cmd.toLowerCase();
            return function (editor, iframeUrl, title){
            
                iframeUrl = iframeUrl || editor.options.iframeUrlMap[cmd.toLowerCase()] || 'about:blank';
                iframeUrl = editor.ui.mapUrl(iframeUrl);
                title = title || editor.options.labelMap[cmd.toLowerCase()] || '';
                var dialog = new editorui.Dialog({
                    iframeUrl: iframeUrl,
                    autoReset: true,
                    draggable: true,
                    editor: editor,
                    className: 'edui-for-' + cmd,
                    title: title,
                    buttons: [{
                        className: 'edui-okbutton',
                        label: '确认',
                        onclick: function (){
                            dialog.close(true);
                        }
                    }, {
                        className: 'edui-cancelbutton',
                        label: '取消',
                        onclick: function (){
                            dialog.close(false);
                        }
                    }],
                    onok: function (){},
                    oncancel: function (){},
                    onclose: function (t, ok){
                        if (ok) {
                            return this.onok();
                        } else {
                            return this.oncancel();
                        }
                    }
                });
                dialog.render();
                var ui = new editorui.Button({
                    className: 'edui-for-' + cmd,
                    title: title,
                    onclick: function (){
                        dialog.open();
                    }
                });
                editor.addListener('selectionchange', function (){
                    var state = editor.queryCommandState(cmd);
                    if (state == -1) {
                        ui.setDisabled(true);
                    } else {

                        ui.setChecked(state);
                        

                        ui.setDisabled(false);
                    }
                });
                return ui;
            };
        }(cmd);
    }
    editorui.WordImage = function(editor){
        var ui = new editorui.Button({
            className: 'edui-for-wordimage',
            title: "图片转存",
            onclick: function (){
                editor.execCommand("wordimage","word_img");
                editor.ui._dialogs['wordImageDialog'].open();

            }
        });
        editor.addListener('selectionchange', function (){
            var state = editor.queryCommandState("wordimage","word_img");
            //if(console)console.log(state);
            if (state == -1) {
                ui.setDisabled(true);
            } else {
                ui.setDisabled(false);
                ui.setChecked(state);
            }
        });
        return ui;
    };

    editorui.FontFamily = function (editor, list, title){
        list = list || editor.options.listMap['fontfamily'] || [];
        title = title || editor.options.labelMap['fontfamily'] || '';
        var items = [];
        for (var i=0; i<list.length; i++) {
            var font = list[i];
            var fonts = editor.options.fontMap[font];
            var value = '"' + font + '"';
            var regex = new RegExp(font, 'i');
            if (fonts) {
                value = '"' + fonts.join('","') + '"';
                regex = new RegExp('(?:\\|)' + fonts.join('|') + '(?:\\|)', 'i');
            }
            items.push({
                label: font,
                value: value,
                regex: regex,
                renderLabelHtml: function (){
                    return '<div class="edui-label %%-label" style="font-family:' +
                        utils.unhtml(this.value) + '">' + (this.label || '') + '</div>';
                }
            });
        }
        var ui = new editorui.Combox({
            editor:editor,
            items: items,
            onselect: function (t,index){
                editor.execCommand('FontFamily', this.items[index].value);
            },
            onbuttonclick: function (){
                this.showPopup();
            },
            title: title,
            initValue: editor.options.ComboxInitial.FONT_FAMILY,
            className: 'edui-for-fontfamily',
            indexByValue: function (value){
                if(value){
                    value = '|' + value.replace(/,/g, '|').replace(/"/g, '') + '|';
                    value.replace(/\s*|\s*/g, '|');
                    for (var i=0; i<this.items.length; i++) {
                        var item = this.items[i];
                        if (item.regex.test(value)) {
                            return i;
                        }
                    }
                }

                return -1;
            }
        });
        editor.addListener('selectionchange', function (type, causeByUi, uiReady){
            if(!uiReady){
                var state = editor.queryCommandState('FontFamily');
                if (state == -1) {
                    ui.setDisabled(true);
                } else {
                    ui.setDisabled(false);
                    var value = editor.queryCommandValue('FontFamily');
                    //trace:1871 ie下从源码模式切换回来时，字体会带单引号，而且会有逗号
                    value && (value = value.replace(/['"]/g,'').split(',')[0]);
                    ui.setValue( value);

                }
            }

        });
        return ui;
    };

    editorui.FontSize = function (editor, list, title){
        list = list || editor.options.listMap['fontsize'] || [];
        title = title || editor.options.labelMap['fontsize'] || '';
        var items = [];
        for (var i=0; i<list.length; i++) {
            var size = list[i] + 'px';
            items.push({
                label: size,
                value: size,
                renderLabelHtml: function (){
                    return '<div class="edui-label %%-label" style="font-size:' +
                        this.value + '">' + (this.label || '') + '</div>';
                }
            });
        }
        var ui = new editorui.Combox({
            editor:editor,
            items: items,
            title: title,
            initValue: editor.options.ComboxInitial.FONT_SIZE,
            onselect: function (t,index){
                editor.execCommand('FontSize', this.items[index].value);
            },
            onbuttonclick: function (){
                this.showPopup();
            },
            className: 'edui-for-fontsize'
        });
        editor.addListener('selectionchange', function (type, causeByUi, uiReady){
            if(!uiReady){
                var state = editor.queryCommandState('FontSize');
                if (state == -1) {
                    ui.setDisabled(true);
                } else {
                    ui.setDisabled(false);
                    ui.setValue(editor.queryCommandValue('FontSize'));
                } 
            }

        });
        return ui;
    };
//    editorui.RowSpacing = function (editor, list, title){
//        list = list || editor.options.listMap['rowspacing'] || [];
//        title = title || editor.options.labelMap['rowspacing'] || '';
//        var items = [];
//        for (var i=0; i<list.length; i++) {
//            var tag = list[i] + 'px';
//            var value = list[i];
//            items.push({
//                label: tag,
//                value: value,
//                renderLabelHtml: function (){
//                    return '<div class="edui-label %%-label" style="font-size:12px">' + (this.label || '') + '</div>';
//                }
//            });
//        }
//        var ui = new editorui.Combox({
//            editor:editor,
//            items: items,
//            title: title,
//            initValue: editor.options.ComboxInitial.ROW_SPACING,
//            onselect: function (t,index){
//                editor.execCommand('RowSpacing', this.items[index].value);
//            },
//            onbuttonclick: function (){
//                this.showPopup();
//            },
//            className: 'edui-for-rowspacing'
//        });
//        editor.addListener('selectionchange', function (type, causeByUi, uiReady){
//            if(!uiReady){
//                var state = editor.queryCommandState('RowSpacing');
//                if (state == -1) {
//                    ui.setDisabled(true);
//                } else {
//                    ui.setDisabled(false);
//                    ui.setValue(editor.queryCommandValue('RowSpacing'));
//                }
//            }
//
//        });
//        return ui;
//    };
    editorui.Paragraph = function (editor, list, title){
        list = list || editor.options.listMap['paragraph'] || [];
        title = title || editor.options.labelMap['paragraph'] || '';
        var items = [];
        for (var i=0; i<list.length; i++) {
            var item = list[i].split(':');
            var tag = item[0];
            var label = item[1];
            items.push({
                label: label,
                value: tag,
                renderLabelHtml: function (){
                    return '<div class="edui-label %%-label"><span class="edui-for-' + this.value + '">' + (this.label || '') + '</span></div>';
                }
            });
        }
        var ui = new editorui.Combox({
            editor:editor,
            items: items,
            title: title,
            initValue: editor.options.ComboxInitial.PARAGRAPH,
            className: 'edui-for-paragraph',
            onselect: function (t,index){
                editor.execCommand('Paragraph', this.items[index].value);
            },
            onbuttonclick: function (){
                this.showPopup();
            }
        });
        editor.addListener('selectionchange', function (type, causeByUi, uiReady){
            if(!uiReady){
                var state = editor.queryCommandState('Paragraph');
                if (state == -1) {
                    ui.setDisabled(true);
                } else {
                    ui.setDisabled(false);
                    var value = editor.queryCommandValue('Paragraph');
                    var index = ui.indexByValue(value);
                    if (index != -1) {
                        ui.setValue(value);
                    } else {
                        ui.setValue(ui.initValue);
                    }
                }
            }

        });
        return ui;
    };


    //自定义标题
    editorui.CustomStyle = function(editor,list,title){
        list = list || editor.options.listMap['customstyle'] || [];
        title = title || editor.options.labelMap['customstyle'] || '';

        for(var i=0,items = [],t;t=list[i++];){
            (function(ti){
                items.push({
                    label: ti.label,
                    value: ti,
                    renderLabelHtml: function (){
                        return '<div class="edui-label %%-label">' +'<'+ ti.tag +' ' + (ti.className?' class="'+ti.className+'"':"")
                            + (ti.style ? ' style="' + ti.style+'"':"") + '>' + ti.label+"<\/"+ti.tag+">"
                            + '</div>';
                    }
                });
            })(t)

        }
      
        var ui = new editorui.Combox({
            editor:editor,
            items: items,
            title: title,
            initValue:editor.options.ComboxInitial.CUSTOMSTYLE,
            className: 'edui-for-customstyle',
            onselect: function (t,index){
                editor.execCommand('customstyle', this.items[index].value);
            },
            onbuttonclick: function (){
                this.showPopup();
            },
            indexByValue: function (value){
                for(var i=0,ti;ti=this.items[i++];){
                    if(ti.label == value){
                        return i-1
                    }
                }
                return -1;
            }
        });
        editor.addListener('selectionchange', function (type, causeByUi, uiReady){
            if(!uiReady){
                var state = editor.queryCommandState('customstyle');
                if (state == -1) {
                    ui.setDisabled(true);
                } else {
                    ui.setDisabled(false);
                    var value = editor.queryCommandValue('customstyle');
                    var index = ui.indexByValue(value);
                    if (index != -1) {
                        ui.setValue(value);
                    } else {
                        ui.setValue(ui.initValue);
                    }
                }
            }

        });
        return ui;
    };
    editorui.InsertTable = function (editor, iframeUrl, title){
        iframeUrl = iframeUrl || editor.options.iframeUrlMap['inserttable'] || 'about:blank';
        iframeUrl = editor.ui.mapUrl(iframeUrl);
        title = title || editor.options.labelMap['inserttable'] || '';
        var dialog = new editorui.Dialog({
            iframeUrl: iframeUrl,
            autoReset: true,
            draggable: true,
            editor: editor,
            className: 'edui-for-inserttable',
            title: title,
            buttons: [{
                className: 'edui-okbutton',
                label: '确认',
                onclick: function (){
                    dialog.close(true);
                }
            }, {
                className: 'edui-cancelbutton',
                label: '取消',
                onclick: function (){
                    dialog.close(false);
                }
            }],
            onok: function (){},
            oncancel: function (){},
            onclose: function (t,ok){
                if (ok) {
                    return this.onok();
                } else {
                    return this.oncancel();
                }
            }
        });
        dialog.render();
        editor.tableDialog = dialog;
        var ui = new editorui.TableButton({
            editor:editor,
            title: title,
            className: 'edui-for-inserttable',
            onpicktable: function (t,numCols, numRows){
                editor.execCommand('InsertTable', {numRows:numRows, numCols:numCols});
            },
            onmore: function (){
                dialog.open();
            },
            onbuttonclick: function (){
                dialog.open();
            }
        });
        editor.addListener('selectionchange', function (){
            var state = editor.queryCommandState('inserttable');
            if (state == -1) {
                ui.setDisabled(true);
            } else {
                ui.setDisabled(false);
            }
        });
        return ui;
    };


    editorui.AutoTypeSet = function (editor, iframeUrl, title){
        title = title || editor.options.labelMap['autotypeset'] || '';
        var ui = new editorui.AutoTypeSetButton({
            editor:editor,
            title: title,
            className: 'edui-for-autotypeset',
            onbuttonclick: function (){
                editor.execCommand('autotypeset')
            }
        });
        editor.addListener('selectionchange', function (){
            ui.setDisabled(editor.queryCommandState('autotypeset') == -1);
        });
        return ui;
    };


    editorui.LineHeight = function (editor, title){
        for(var i=0,ci,items=[];ci = editor.options.listMap.lineheight[i++];){
            items.push({
                //todo:写死了
                label : ci == '1' ? '默认' : ci,
                value: ci,
                onclick:function(){
                    editor.execCommand("lineheight", this.value);
                }
            })
        }
        var ui = new editorui.MenuButton({
            editor:editor,
            className : 'edui-for-lineheight',
            title : title || editor.options.labelMap['lineheight'] || '',
            items :items,
            onbuttonclick: function (){
                var value = editor.queryCommandValue('LineHeight') || this.value;
                editor.execCommand("LineHeight", value);
            }
        });
        editor.addListener('selectionchange', function (){
            var state = editor.queryCommandState('LineHeight');
            if (state == -1) {
                ui.setDisabled(true);
            } else {
                ui.setDisabled(false);
                var value = editor.queryCommandValue('LineHeight');
                value && ui.setValue((value + '').replace(/cm/,''));
                ui.setChecked(state)
            }
        });
        return ui;
    };
    editorui.RowSpacingTop = function (editor, title){
        for(var i=0,ci,items=[];ci = editor.options.listMap.rowspacing[i++];){
            items.push({
                label : ci,
                value: ci,
                onclick:function(){
                    editor.execCommand("rowspacing", this.value,'top');
                }
            })
        }
        var ui = new editorui.MenuButton({
            editor:editor,
            className : 'edui-for-rowspacingtop',
            title : title || editor.options.labelMap['rowspacingtop'] || '段前间距',
            items :items,
            onbuttonclick: function (){
                var value = editor.queryCommandValue('rowspacing','top') || this.value;
                editor.execCommand("rowspacing", value,'top');
            }
        });
        editor.addListener('selectionchange', function (){
            var state = editor.queryCommandState('rowspacing','top');
            if (state == -1) {
                ui.setDisabled(true);
            } else {
                ui.setDisabled(false);
                var value = editor.queryCommandValue('rowspacing','top');
                value && ui.setValue((value + '').replace(/%/,''));
                ui.setChecked(state)
            }
        });
        return ui;
    };
    editorui.RowSpacingBottom = function (editor, title){
        for(var i=0,ci,items=[];ci = editor.options.listMap.rowspacing[i++];){
            items.push({
                label : ci,
                value: ci,
                onclick:function(){
                    editor.execCommand("rowspacing", this.value,'bottom');
                }
            })
        }
        var ui = new editorui.MenuButton({
            editor:editor,
            className : 'edui-for-rowspacingbottom',
            title : title || editor.options.labelMap['rowspacingbottom'] || '段后间距',
            items :items,
            onbuttonclick: function (){
                var value = editor.queryCommandValue('rowspacing','bottom') || this.value;
                editor.execCommand("rowspacing", value,'bottom');
            }
        });
        editor.addListener('selectionchange', function (){
            var state = editor.queryCommandState('rowspacing','bottom');
            if (state == -1) {
                ui.setDisabled(true);
            } else {
                ui.setDisabled(false);
                var value = editor.queryCommandValue('rowspacing','bottom');
                value && ui.setValue((value + '').replace(/%/,''));
                ui.setChecked(state)
            }
        });
        return ui;
    };
    editorui.InsertOrderedList = function (editor, title){
        title = title || editor.options.labelMap['insertorderedlist'] || '';
        var _onMenuClick = function(){
            editor.execCommand("InsertOrderedList", this.value);
        };
        var ui = new editorui.MenuButton({
            editor:editor,
            className : 'edui-for-insertorderedlist',
            title : title,
            items :
                [{
                    label: '1,2,3...',
                    value: 'decimal',
                    onclick : _onMenuClick
                },{
                    label: 'a,b,c ...',
                    value: 'lower-alpha',
                    onclick : _onMenuClick
                },{
                    label: 'i,ii,iii...',
                    value: 'lower-roman',
                    onclick : _onMenuClick
                },{
                    label: 'A,B,C',
                    value: 'upper-alpha',
                    onclick : _onMenuClick
                },{
                    label: 'I,II,III...',
                    value: 'upper-roman',
                    onclick : _onMenuClick
                }],
            onbuttonclick: function (){
                var value = editor.queryCommandValue('InsertOrderedList') || this.value;
                editor.execCommand("InsertOrderedList", value);
            }
        });
        editor.addListener('selectionchange', function (){
            var state = editor.queryCommandState('InsertOrderedList');
            if (state == -1) {
                ui.setDisabled(true);
            } else {
                ui.setDisabled(false);
                var value = editor.queryCommandValue('InsertOrderedList');
                ui.setValue(value);
                 ui.setChecked(state)
            }
        });
        return ui;
    };

    editorui.InsertUnorderedList = function (editor, title){
        title = title || editor.options.labelMap['insertunorderedlist'] || '';
        var _onMenuClick = function(){
            editor.execCommand("InsertUnorderedList", this.value);
        };
        var ui = new editorui.MenuButton({
            editor:editor,
            className : 'edui-for-insertunorderedlist',
            title: title,
            items:
                [{
                    label: '○ 小圆圈',
                    value: 'circle',
                    onclick : _onMenuClick
                },{
                    label: '● 小圆点',
                    value: 'disc',
                    onclick : _onMenuClick
                },{
                    label: '■ 小方块',
                    value: 'square',
                    onclick : _onMenuClick
                }],
            onbuttonclick: function (){
                var value = editor.queryCommandValue('InsertUnorderedList') || this.value;
                editor.execCommand("InsertUnorderedList", value);
            }
        });
        editor.addListener('selectionchange', function (){
            var state = editor.queryCommandState('InsertUnorderedList');
            if (state == -1) {
                ui.setDisabled(true);
            } else {
                ui.setDisabled(false);
                var value = editor.queryCommandValue('InsertUnorderedList');
                ui.setValue(value);
                ui.setChecked(state)
            }
        });
        return ui;
    };
    
    editorui.FullScreen = function (editor, title){
        title = title || editor.options.labelMap['fullscreen'] || '';
        var ui = new editorui.Button({
            className: 'edui-for-fullscreen',
            title: title,
            onclick: function (){
                if (editor.ui) {
                    editor.ui.setFullScreen(!editor.ui.isFullScreen());
                }
                this.setChecked(editor.ui.isFullScreen());
            }
        });
        editor.addListener('selectionchange', function (){
            var state = editor.queryCommandState('fullscreen');
            ui.setDisabled(state == -1);
            ui.setChecked(editor.ui.isFullScreen());
        });
        return ui;
    };

    
    editorui.Emotion = function(editor, iframeUrl, title){
        title = title || editor.options.labelMap['emotion'] || '';
        iframeUrl = iframeUrl || editor.options.iframeUrlMap['emotion'] || 'about:blank';
        iframeUrl = editor.ui.mapUrl(iframeUrl);
        var ui = new editorui.MultiMenuPop({
            title: title,
            editor: editor,
            className: 'edui-for-emotion',
            iframeUrl: iframeUrl
        });
        editor.addListener('selectionchange', function (){

            var state = editor.queryCommandState('emotion');
            if (state == -1) {
                ui.setDisabled(true);
            } else {
                ui.setDisabled(false);
            }
        });
        return ui; 
    };
})();
