#!/bin/bash

# Installation dependency
npm install

# Installation Git hooks
npm run prepare

# Installation VS Code extension
code --install-extension esbenp.prettier-vscode
code --install-extension dbaeumer.vscode-eslint
code --install-extension editorconfig.editorconfig

# Perform initial formatting
npm run format

echo "Project initialization complete!"
