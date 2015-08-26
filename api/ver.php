<?php
echo PHP_VERSION;
if (version_compare(PHP_VERSION, '5.2.0') >= 0) {
    echo 'I am at least PHP version 5.2.0, my version: ' . PHP_VERSION . "\n";
} else {
	echo "I do not support json_encode";
}

?>