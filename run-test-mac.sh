#!/bin/bash
tester_dir="$(dirname ${BASH_SOURCE[0]})"

data_dir="$tester_dir/../../mock-data"
test_conf="$tester_dir/test-setup.json"
signup_url="https://3nweb.net/signup/"

if [ -n "$1" ]
then
	platform="$1"
else
	platform="$tester_dir/test-runner"
fi

if [ ! -x "$platform" ]
then
	echo "$platform doesn't have execution permission, or it isn't a file"
	echo "You can pass different platform path as the first argument to this script"
	exit 1;
fi

for port in 8099 #9000
do
	PORT=$port ./node_modules/.bin/vue-devtools &
done

echo "Starting test run on $platform with data folder $data_dir"

"$platform"/Contents/MacOS/PrivacySafe -- "--signup-url=$signup_url" "--data-dir=$data_dir" --allow-multi-instances --devtools "--test-stand=$test_conf"
