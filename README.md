# Printers Discovery
This application aims to analyze the local network in search of prototypes of printers, capturing and storing their information.

The interface allows users to view the information collected in three different ways, these being the icon view, the list view
and the column view (accessible from the left buttons).

In the central part of the interface is the search field, which allows a basic filtering of the displayed information. If a more
advanced filtering is needed, users can create custom advanced filters (second right button).

Regarding the interaction with the information shown, users can click on one of the printers to view detailed information or to
edit it. In addition, through the context menu (right-click mouse), users can access extra features, such as the reservation calendar.

Check out a real example of the application from [here](http://chema22r.duckdns.org/printersDiscovery).

## Setup and Run
1. Download the source code
2. Do the following from inside the *server* folder:
    - Install the node modules executing `npm i`
    - Execute one of the following commands:
        - `npm start` to run the application in live-reload mode (development)
        - `npm run build` to build the application (production)
3. Do the following from inside the *client* folder:
    - Install the node modules executing `npm i`
    - Execute one of the following commands:
        - `npm start` to build the application (development)
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
|- README.md
```