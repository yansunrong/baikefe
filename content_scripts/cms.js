/**
 * Created with JetBrains PhpStorm.
 * User: 孙荣
 * Date: 13-5-4
 * Time: 下午5:40
 * To change this template use File | Settings | File Templates.
 */
//选中root

//if(localStorage['iscms']){
    var root = document.querySelector("#cb_0");
    if(root){

        document.querySelector("#cb_1") && setTimeout(function () {
            root.click();
            document.querySelector("input[name='submit_page']").click();
          //  localStorage['iscms'] = false;
        }, 1000)
    }
//}


//console.log($("#cb_0"));
// $("#cb_0").click();