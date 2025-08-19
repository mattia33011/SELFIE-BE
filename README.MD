## LINK BUILD

https://mega.nz/folder/eFMlUSSY#s6e1ovrBLO006jsSuKO2LA

## How to deploy
to build production run: 

```bash
npx esbuild src/index.ts   --bundle   --platform=node   --target=node22   --outfile=dist/index.js  
```
then it will generate the folder dist with a file named "index.js" this is the only entry point of the backend
copy it in the project with the frontend folder and start gocker node-22 server.