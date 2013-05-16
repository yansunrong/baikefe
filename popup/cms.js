/**
 * Created with JetBrains PhpStorm.
 * User: 孙荣
 * Date: 13-5-4
 * Time: 下午6:29
 * To change this template use File | Settings | File Templates.
 */

function startPublic(mid,opt) {
	//console.log(mid);
	//console.log(opt);
	
    var progress = $("#progress");
    progress.css("width", "20%");
    var importUrl = "http://icms.baidu.com:8080/cmscript/fire/id/cms_tplplatform_files/?action=import_scmpf";
    var svn, md5, version;

	//2 普通上线
    if (mid == 2) {
		/*
        svn = $('input[name="svn"]:checked').val();
        if (svn == "other") {
            svn = $.trim($("#svn-path").val());
            if (svn == '') {
                alert('请输入svn地址');
                $("#svn-path").focus();
                return;
            }
        }
        version = $("#version").val();
        md5 = $.trim($("#md5").val());
		*/
		svn = opt['svn'];
		version = opt['version'];
		md5 = opt['md5'];
		icafe = opt['icafe'];
	}

    if (mid == 3) {//清缓存
        svn = "app/search/wiki/fe/kedou";
        version = "1.0.3";
        md5 = "6cd02a2f45d0a1af04384977a165c7b5";
    }

    importUrl += "&svn=" + encodeURIComponent(svn) + "&ver=" + version;
    $.get(importUrl).done(function (result) {
        progress.css("width", "40%")
        // console.log(result)
        var matches = result.match(/<td>MD5校验码：<strong>(\w+)<\/strong><\/td>/i)
        if (matches && matches.length > 1) {
            if (md5 == matches[1] || icafe == 1) {//如果MD5相同 或者从icafe内上线，则继续 
                var scmpf = result.match(/<textarea readonly="readonly" id="" name="" rows="3" cols="60">([^<]+)<\/textarea>/)[1]
                //alert(scmpf)
                var url = "http://icms.baidu.com:8080/cmscript/fire/id/cms_tplplatform_files/?action=file_choose&scmpf_version_tag=" + version;
                var form = {
                    "type": 2,
                    "mid": mid,
                    "scmpf": encodeURIComponent(scmpf)
                }
				
				//console.log(url);
				//console.log(form);
				//return;
                $("#result").load(url, form, function (data) {
                    progress.css("width", "60%")
                    //console.log(data)
                    var url2 = "http://icms.baidu.com:8080/cmscript/fire/id/cms_tplplatform_files/?action=scmpf_file_import";
                    var cb = [], path = [];
                    for (var i = 0, item; item = treeData[i]; i++) {
                        if (item.has_child == 0) {
                            //path.push(item.orig_path);

                            cb.push('<input name="cb[]" value="' + [item.orig_path, item.orig_path, item.orig_path].join('|') + '"/>');
                            path.push('<input name="path[]" value="' + item.orig_path + '"/>');
                        } else {
                            cb.push('<input name="cb[]" value="0"/>')
                        }
                    }
                    $(cb.join('')).appendTo("#tasktemplate");
                    $(path.join('')).appendTo("#tasktemplate");
                    var form2 = $("#tasktemplate").serializeArray()
                        				//console.log(form2)
                    $.post(url2, form2, function (data2) {
                        progress.css("width", "80%")
                        		//console.log(data2)
                        if (data2.indexOf('导入成功')) {
							var iframeHeight = 500;
							if (mid==1){
								iframeHeight = 300;
							}
                            $("#iframe").html('<iframe width="100%" height="'+iframeHeight+'px" src="http://icms.baidu.com:8080/cmscript/fire/id/cms_tplplatform_files/?action=module_import&id=2&mid=' + mid + '&noclear=1&type=2&scmpf_version_tag=1.0.3" frameborder="0"></iframe>');
                        }
                    })
                });
            }
        }

    });
}

function clearPage() {
    startPublic(3);
}

//输入框加验证
$('.svnList input[name="svn"]').on('click',function(){
	if ($(this).attr('checked') == 'checked'){
		$(this).parent().siblings().attr('required',true);
	}else{
		$(this).parent().siblings().attr('required',false)
	}
})

/**
* 获取svn数据list
* @author putaoshu@126.com
* @update 2013-5-15 16:21:56
*/

function getSvnList(){
	var svnArray = $('.svnList input[name="svn"]:checked');
	var data = [];
	$.each(svnArray,function(i){
		var svn = $(svnArray[i]);
		var inp = svn.parent().siblings();
		var version = inp[0];
		var md5 = inp[1];
		var svnurl = inp[2];

		for (var i=0 ; i<inp.length ; i++){
			if (inp[i].value == ''){
				return false;
			}
		}
				
		data.push({
			'svn':svnurl.value.trim(),
			'version':version.value.trim(),
			'md5':md5.value.trim(),
		})
	})
	return data;
}

/**
* 统计上线函数
* @author putaoshu@126.com
* @update 2013-5-15 16:21:56
*/

function goToOnline(mid,svnList){
	if (svnList.length>0){
		$.each(svnList,function(i){
			startPublic(mid,svnList[i]);
		})
	}
}

$("#cms-form").on('submit', function (event) {
    var src = $(event.srcElement);
    event.stopPropagation();
    event.preventDefault();
	
	var svnList = getSvnList();
	if (svnList.length>0){
		/*
		var choose = confirm("您确定要上线吗？");
		if(!choose){
			return;
		}
		*/

		//console.log(svnList);
		if ($("#cms-form")[0].checkValidity) {
			checkLogin(function(){
				goToOnline(2,svnList);
			})
		}
	}
})

$("#clearPage").click(clearPage);

//檢查是否已經登錄
function checkLogin(fn) {
    $.get('http://icms.baidu.com:8080/').done(function (data) {
        if (data.indexOf("http://icms.baidu.com:8080/static/login.php") > 0) {
            $(".alert-login").show();
            // alert('大哥，先登錄一下吧~~');
            // location.href="http://icms.baidu.com:8080/";
        } else {
            fn.call();
        }
    });
}

/*
$("[name=svn]").change(function () {
    if ($(this).val() == 'other') {
        $('#svn-path').fadeIn();
    } else {
        $('#svn-path').fadeOut();
    }
});
*/

/**
* 在icafe内一键上线,包括单模块上线和多模块上线
* @author putaoshu@126.com
* @update 2013-5-15 16:21:56
*/
if ($('#ssbody').length>0){

	//插单模块上线html
	var o = $('#ssbody tr');
	$.each(o,function(i){
		//checkbox
		var td0 = $('td',o[i])[0];
		var $td0 = $(td0);
		$td0.css({width:90});
		
		//产品模块信息
		var $td1 = $td0.next('td');
		//版本号 版本状态(?)
		var $td2 = $td1.next('td');
		var status = $('span',$td2).text().trim();
		status = status.replace(' ','');
		status = status.split('(')[0].trim();

		if (status == 'releasing'){
			var a = $('a',$td1).eq(0).text().trim();
			a = a.split(' ');
			var svnurl = a[0];
			var version = a[1];
			
			$td0.append(' &nbsp;&nbsp;<a class="oneKeyOnline" data-svnurl="'+svnurl+'" data-version="'+version+'"><img src="http://baike.baidu.com/cms/rc/quickcms48.png" style="vertical-align: middle;width: 25px;height: 25px;"> 快上线 </a>');
		}
	});

	if ($('#ifram').length==0){
		var html = '<div id="result" style="display: none;"></div><div id="iframe" style="padding:10px;margin:0 10px;border-bottom:1px solid #ccc;font-weight:bold;"></div>';
		$('#viewlist').before(html);

		var topHtml='<li class="ready" style="margin-right:20px;"><div class="trunk hand"><a id="oneKeyOnlineTop" style="display:block;color:#fff;padding-top:7px;" title="多模块上线"><img src="http://baike.baidu.com/cms/rc/quickcms48.png" style="vertical-align: middle;width: 20px;height: 20px;">快上线</a></div></li>';
		$('#wizard-flow ol li').eq(0).before(topHtml);
	}
	
	var loadingHtml = '<img src="http://baike.baidu.com/cms/rc/loadingIcon.gif" style="vertical-align: middle;"> 上线处理中,请稍侯....';

	//单个上线
	$('.oneKeyOnline').click(function(){
		$('#iframe').html(loadingHtml);
		var svnurl = $(this).data('svnurl').trim();
		var version = $(this).data('version').trim();
		var data = [];	
		data.push({
			'svn':svnurl,
			'version':version,
			'md5':'',
			'icafe':1
		})
		goToOnline(2,data);
	})
	
	//批量上线
	$('#oneKeyOnlineTop').click(function(){
		var checked = $('#ssbody input[name="selectedModules"]:checked').next();
		if (checked.length>0){
			$('#iframe').html(loadingHtml);
			var data = [];	
			$.each(checked,function(i){
				var $oneKeyOnline = $(checked[i]);			
				var svnurl = $oneKeyOnline.data('svnurl');
				var version = $oneKeyOnline.data('version');
				data.push({
					'svn':svnurl,
					'version':version,
					'md5':'',
					'icafe':1
				})
			})
			goToOnline(2,data);
		}
	})
}