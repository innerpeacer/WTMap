#!/usr/bin/env bash
project=WTMap
user=root
host=47.97.173.242
local_webapps=/Users/innerpeacer/Dev/apache-tomcat-7.0.59/webapps
storm_webapps=/Users/innerpeacer/WebstormProjects
remote_webapps=/usr/local/apache-tomcat-7.0.81/webapps


echo "********************************************************************"
echo "Project: ${project} =>  Remote: ${user}@${host}"
echo "Storm: ${storm_webapps}"
echo "Local: ${local_webapps}"
echo "Remote: ${remote_webapps}"
echo "********************************************************************"
echo ""

function uploadFile() {
    filepath=$1
    echo "Upload File: ${filepath}"

    localPath=${storm_webapps}/${project}/${filepath}
    remotePath=${user}@${host}:${remote_webapps}/${project}/${filepath}
#    echo ${localPath}
#    echo ${remotePath}
    scp ${localPath} ${remotePath}
}

uploadFile html/wtmap/js/helper.js

#uploadFile html/lab/WTMap-BleSampleSimulator.html
#uploadFile html/lab/WTMap-BleSampleDetail.html
#uploadFile dist/lab.js

#mapwar=WTMapService.war
#echo "Upload: ${mapwar}"
#scp ${local_webapps}/${mapwar} ${user}@${host}:${remote_webapps}/${mapwar}
