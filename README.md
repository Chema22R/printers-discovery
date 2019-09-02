[![Netlify Status](https://api.netlify.com/api/v1/badges/3385f038-9813-4df8-992d-ddc4af8ff42b/deploy-status)](https://app.netlify.com/sites/printersdiscovery/deploys)
[![dependencies Status](https://david-dm.org/chema22r/printersdiscovery/status.svg)](https://david-dm.org/chema22r/printersdiscovery)
[![devDependencies Status](https://david-dm.org/chema22r/printersdiscovery/dev-status.svg)](https://david-dm.org/chema22r/printersdiscovery?type=dev)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Chema22R/printersdiscovery.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Chema22R/printersdiscovery/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Chema22R/printersdiscovery.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Chema22R/printersdiscovery/context:javascript)

# Printers Discovery
This application aims to analyze the local network in search of prototypes of printers, capturing and storing their information.

The interface allows users to view the information collected in three different ways, these being the icon view, the list view
and the column view (accessible from the left buttons).

In the central part of the interface is the search field, which allows a basic filtering of the displayed information. If a more
advanced filtering is needed, users can create custom advanced filters (second right button).

Regarding the interaction with the information shown, users can click on one of the printers to view detailed information or to
edit it. In addition, through the context menu (right-click mouse), users can access extra features, such as the reservation calendar.

Check out a real example of the application from [here](https://printersdiscovery.chema22r.com).

## Setup and Run
1. Download the source code
2. Install the node modules executing `npm run i`
3. Execute one of the following commands
    - `npm start` to run the application in live-reload mode (development)
    - `npm run build` to build the application (production)

## Directories Structure
```
|- /client
    |- /src
        |- /app
            |- ...
        |- /assets
            |- /favicons
                |- ...
            |- /icons
                |- ...
            |- /images
                |- ...
            |- /style
                |- ...
        |- index.html
        |- index.js
    |- package.json
    |- webpack.config.js
    |- webpack.dev.js
    |- webpack.prod.js
|- /server
    |- /src
        |- /app
            |- ...
        |- HPDiscovery
        |- index.js
    |- package.json
    |- webpack.config.js
    |- webpack.dev.js
    |- webpack.prod.js
|- .gitignore
|- LICENSE
|- package.json
|- README.md
```