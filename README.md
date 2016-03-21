# redux-firebase [![build status](https://travis-ci.org/gobadiah/redux-firebase.svg)](https://travis-ci.org/gobadiah/redux-firebase) 

Redux firebase makes the connection between your firebase backend and your redux store, using a schema.

## Installation

    npm install --save redux-firebase@https://github.com/gobadiah/redux-firebase
    
## Usage

First define your schemas in `schemas.js` like so :

```javascript
import { Schema } from 'redux-firebase';
    
const drivers = new Schema('drivers');
const cars    = new Schema('cars');

drivers.hasMany(cars, 'private_cars', 'owner');

export default {
  drivers,
  cars
};
```

Then you need to use : 

1. Redux-firebase middleware and reducer :

```javascript
import { create 
```
    
2. Test


    

		
