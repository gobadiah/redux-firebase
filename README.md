# redux-firebase [![build status](https://travis-ci.org/gobadiah/redux-firebase.svg)](https://travis-ci.org/gobadiah/redux-firebase) 

Redux firebase makes the connection between your firebase backend and your redux store, using a schema.

## Installation

    npm install --save redux-firebase@https://github.com/gobadiah/redux-firebase
    
## Usage

First define your schemas like so

    import { Schema } from 'redux-firebase';
    
    const drivers 		= new Schema('drivers');
    const cars    		= new Schema('cars');
    
In this case we assume that a driver can have many cars, and many technicians at his or her service, but if we destroy a driver, the cars disappear as well, but not the technicians. 

	drivers.hasMany(cars, 'race_cars', 'owner');

		
