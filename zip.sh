#!/bin/bash
set -eo pipefail

cd ./dist && zip -r dev-mode-extension ./ && mv dev-mode-extension.zip ../
echo "DID YOU BUMP THE VERSION NUMBER IN THE MANIFEST.JSON?"
