## LINK BUILD

https://mega.nz/folder/eFMlUSSY#s6e1ovrBLO006jsSuKO2LA

## How to deploy

to build production run:

remember to set mongodb url!!

```bash
npx esbuild src/index.ts   --bundle   --platform=node   --target=node22   --outfile=dist/index.js
```

then it will generate the folder dist with a file named "index.js" this is the only entry point of the backend
copy it in the project with the frontend folder and start gocker node-22 server.

make sure that in the same root of the generated index.js there is a folder in "src/templates" with all the template html files

### How to login

use this command to login:

```bash
ssh mattia.iaria@studio.unibo.it@eva.cs.unibo.it
```

then go

```bash
cd /home/web/site242521/html
```

check your files

if something is missing use this:

```bash
rsync -avh Local/Path   mattia.iaria@studio.unibo.it@eva.cs.unibo.it:/home/web/site242521/html/
```


Then login in gocker:

```bash
ssh gocker
```
Start mongo

Start server
```bash
start node-22 site242521 index.js
```
Start mongo
```bash
start mongo site242521 
```