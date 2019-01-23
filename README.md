# Crawler API

Crawler App that has different enpoints returning JSON Objects with data from the corresponding crawled pages.

**`This is a personal project. If you are interested in clone it feel free to use it as a starting point for your own Crawler API. Good luck my friend :)`**

## Instalation & run the project

* clone the repo `$ git clone https://github.com/adriamarti/Crawler-API.git`
* navigate to the cloned project `$ cd Crawler-API`
* install all project dependencies with `npm install`
* start the development server with `npm start`

## Code architecture

The API is build following the MVC (model-view-controller) where the views are the different routes. 
```bash
├── README.md - This file.
├── package.json # npm package manager file. It's unlikely that you'll need to modify this.
├── api
│   ├── routes # Contains all the routes available along the API.
│   └── services # Contains srevices consumed along the API.
├── app.js # This is the root of the API.
├── app.yaml # Deployment file.
├── .gitignore # Gitignore file.
├── package.json # npm package manager file. It's unlikely that you'll need to modify this.
└── server.js # server configuration.    
```

## Endpoints

### `/libraccio/:ISBN`
### `/mondadori/:ISBN`
### `/lafeltrinelli/:ISBN`
### `/book/:ISBN`

## @TODO's

* Create Great API Documentation (maybe with swagger).
* Refactore routes and services to a MVC pattern.
* Create and add to the project a Postman collection file to facilitate testing.