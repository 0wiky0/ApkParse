var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;
var Zip = require('adm-zip');

function execute(command, callback) {
	exec(command, function(error, stdout, stderr) {
		callback(stdout);
		if (error) {
			console.log(error);
		}
		if (stderr) {
			console.log(stderr);
		}
	});
}

function parseApkFile(apkPath, callback) {
	//判断文件是否存在
    if(!fs.existsSync(apkPath)){
        console.log('file not exists, check path = '+apkPath);
    	return
    }

    //获取apk包大小
	var appInfo = {};
	fs.stat(apkPath, function (err, stats) {
      if (err) {
          console.log('读取文件信息失败');
      }            
      appInfo['apkSize']=stats.size;
   })    

	//利用aapt工具获取app信息
	var aapt = path.join(path.dirname(fs.realpathSync(__filename)), 'aapt');
	// var uploadsDir = path.join(path.dirname(fs.realpathSync(__filename)), '..');
	var command = aapt + " d badging " + apkPath;
	execute(command, function(output) {
		// console.log('output is ' + output);
		var info = output.split('\n');
		var tmp, i, j;
		
        
		for (i in info) {
			tmp = info[i];
			if (tmp.match(/^package:/)) {
				// 'package: name=\'com.goldnet.mobile\' versionCode=\'1\' versionName=\'1.0\''
				tmp = tmp.slice('package:'.length).trim();
				tmp = tmp.split(/\s+/);

				for (j in tmp) {
					if (tmp[j].match(/^name=/)) {
						appInfo['packageName'] = getValueByKeyStr(tmp[j]);
					} else if (tmp[j].match(/^versionCode=/)) {
						appInfo['versionCode'] = getValueByKeyStr(tmp[j]);
					} else if (tmp[j].match(/^versionName/)) {
						appInfo['versionName'] = getValueByKeyStr(tmp[j]);
					}
				}

			} else if (tmp.match(/^sdkVersion:/)) {
				// sdkVersion:'9'
				appInfo['minSdkVersion'] = getValueByKeyStr(tmp);
				
			}  else if (tmp.match(/^targetSdkVersion:/)) {
				appInfo['targetSdkVersion'] = getValueByKeyStr(tmp);

			} else if (tmp.match(/^application:/)) {
				tmp = tmp.slice('application:'.length).trim();
				tmp = tmp.split(/\s+/);

				for (j in tmp) {
					if (tmp[j].match(/^label=/)) {
						appInfo['appName'] = getValueByKeyStr(tmp[j]);
					} else if (tmp[j].match(/^icon=/)) {
						appInfo['iconName'] = getValueByKeyStr(tmp[j]);
					} 
				}
			} 
			// else if (tmp.match(/^uses-permission:/)) {
			// 	if (!appInfo.hasOwnProperty('uses-permission')) {
			// 		appInfo['uses-permission'] = [tmp.slice('uses-permission:'.length)];
			// 	} else {
			// 		appInfo['uses-permission'].push(tmp.slice('uses-permission:'.length));
			// 	}
			// } else if (tmp.match(/^sdkVersion:/)) {
			// 	appInfo['minSdkVersion'] = tmp.slice('sdkVersion:'.length);
			// } else if (tmp.match(/^application-label:/)) {
			// 	appInfo['application-label'] = tmp.slice('application-label:'.length);
			// } else if (tmp.match(/^launchable-activity:/)) {
			// 	// 'launchable-activity: name=\'com.goldnet.mobile.activity.AppStartActivity\'  label=\'\' icon=\'\''
			// 	tmp = tmp.slice('launchable-activity:'.length).trim();
			// 	tmp = tmp.split(/\s+/);
			// 	for (j in tmp) {
			// 		if (tmp[j].match(/^name=/)) {
			// 			appInfo['launch-activity'] = tmp[j].slice('name='.length);
			// 			break;
			// 		}
			// 	}
			// }
		}
		if (callback) {
			callback(appInfo);
		}
	});
}

//从字符串（key='value'或key:'value'）中获取value值
function getValueByKeyStr(str){
	var array = str.split('\'');
	if(array.length>1){
		 return str.split('\'')[1];
	}
	console.error("[getValueByKeyStr] 方法使用有误, 参数格式为:key='value'或key:'value'，当前参数为 = "+str);
    return "undefined"
}


//保存图标至指定路径
function saveIcon(apkPath,iconName, path){
	var zip = new Zip(apkPath);
	var entry = zip.getEntry(iconName);
	fs.writeFile(path, entry.getData(), function (err) {
	    if (err) {
	        console.log(err);
	    } else {
	        console.log('save icon success.');
	    }
		// fs.close();
	});
}

module.exports = {
    parseApkFile: parseApkFile,
    saveIcon: saveIcon
}