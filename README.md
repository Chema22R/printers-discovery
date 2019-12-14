[![Netlify Status](https://api.netlify.com/api/v1/badges/3385f038-9813-4df8-992d-ddc4af8ff42b/deploy-status)](https://app.netlify.com/sites/printersdiscovery/deploys)
[![Total alerts](https://img.shields.io/lgtm/alerts/g/Chema22R/printers-discovery.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Chema22R/printers-discovery/alerts/)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/Chema22R/printers-discovery.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/Chema22R/printers-discovery/context:javascript)

# Printers Discovery
This application aims to analyze the local network in search of prototypes of printers, capturing and storing their information.

The interface allows users to view the information collected in three different ways: the icons view, the list view and the columns view (accessible from the upper left buttons).

In the upper central part of the interface is the search field, which allows a basic filtering of the information displayed. If a more advanced filtering is required, users can create custom filters (second upper right button).

Regarding the interaction with the information shown, users can click on one of the printers to view detailed information or edit it. In addition, through the context menu (right mouse button), users can access extra features, such as the reservation calendar.

Check out a real example of the application from [here](https://printersdiscovery.chema22r.com).

## Setup and Run
1. Download the source code
2. Install the node modules executing `npm run i`
3. Execute one of the following commands to build the application
    - `npm run build` (production)
    - `npm run build-dev` (development)
4. The build code can be found in `./client/dist` and `./server/dist`

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
|- Procfile
|- README.md
```
