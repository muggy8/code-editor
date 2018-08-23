# About
Code Editor is a node / npm based app that provides a GUI editor using the web browser

## Usage
Open up your terminal on your computer and enter the following commands replacing `/path/to/project` with the path to your project folder.
```bash
npm install -g @muggy8/code-editor
cd /path/to/project
editor
```

## Why?
I'm pretty sure at this point you dont need me to tell you that there is a large number of code editors that are avalable to devolopers and are probably much better than this app is at editing code. However the main reason for this project to is to build a pretty GUI editor for devices where the luxury of Electrons based editors (looking at you Atom, VS Code and the likes) aren't avalable or are much harder to get working, namely ARM based devices.

Because all of these devices often have some kind of browser support as well as nodeJS and consiquently NPM. This is why this project only relies on these two simple depenedncies and by using the ACE editor as the front end, the editor is able to bring a higher level of user experiance to these lower end device users.

## Licence?
This is a public open source project under the MIT licence. Hope you enjoy :)