/**
 * Created with JetBrains PhpStorm.
 * User: 孙荣
 * Date: 13-5-4
 * Time: 下午6:29
 * To change this template use File | Settings | File Templates.
 */

function startPublic() {
    var progress = $("#progress");
    progress.css("width", "20%");
    var importUrl = "http://icms.baidu.com:8080/cmscript/fire/id/cms_tplplatform_files/?action=import_scmpf";
    var svn, md5, version;
    if (mid == 2) {//普通上线
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
    } else {//清缓存
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
            if (md5 == matches[1]) {//如果MD5相同，则继续
                var scmpf = result.match(/<textarea readonly="readonly" id="" name="" rows="3" cols="60">([^<]+)<\/textarea>/)[1]
                //alert(scmpf)
                var url = "http://icms.baidu.com:8080/cmscript/fire/id/cms_tplplatform_files/?action=file_choose&scmpf_version_tag=" + version;
                var form = {
                    "type": 2,
                    "mid": mid,
                    "scmpf": encodeURIComponent(scmpf)
                }
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
                    //    				console.log(form2)
                    $.post(url2, form2, function (data2) {
                        progress.css("width", "80%")
                        //		console.log(data2)
                        if (data2.indexOf('导入成功')) {
                            $("#iframe").html('<iframe width="100%" height="500px" src="http://icms.baidu.com:8080/cmscript/fire/id/cms_tplplatform_files/?action=module_import&id=2&mid=' + mid + '&noclear=1&type=2&scmpf_version_tag=1.0.3" frameborder="0"></iframe>');
                        }
                    })
                });
            }
        }

    });
}

var mid = 2;
function clearPage() {
    mid = 3;
    startPublic();
}
$("#cms-form").on('submit', function (event) {
    var src = $(event.srcElement);
    event.stopPropagation();
    event.preventDefault();
    if ($("#cms-form")[0].checkValidity) {
        checkLogin(startPublic)
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
            fn();
        }
    });
}


$("[name=svn]").change(function () {
    if ($(this).val() == 'other') {
        $('#svn-path').fadeIn();
    } else {
        $('#svn-path').fadeOut();
    }
});