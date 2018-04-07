# To pack:

```bash
# from this folder
npm run build

# to test installation locally before publishing
npm install ./path

# to develop, use link (like pip -e option)
npm link ./path

# for example:
npm link D:\Root\github\DataEntry -> this folder contains entry point and built package

# from upper folder:
npm pack

# publish (...)

# create distribution files:
gulp dist
```