require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const POKEDEX = require('./pokedex.json');

const app = express();

const morganSetting = process.env.NODE_ENV === 'production' ? 'tiny' : 'common';
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());

app.use(function validateBearerToken(req, res, next) {
    const authToken = req.get('Authorization');
    const apiToken = process.env.API_TOKEN;

    if( !authToken || apiToken !== authToken.split(' ')[1]){
        return res.status(401).json({error: 'Unauthorized request.'})
    }
    //move to the next midware
    next();
});


const validTypes = [`Bug`, `Dark`, `Dragon`, `Electric`, `Fairy`, `Fighting`, `Fire`, `Flying`, `Ghost`, `Grass`, `Ground`, `Ice`, `Normal`, `Poison`, `Psychic`, `Rock`, `Steel`, `Water`]



function handleGetTypes(req, res) {
    res.json(validTypes);
};

app.get('/types', handleGetTypes)

function handleGetPokemon(req, res) {
    const { name, type } = req.query;

    if(!name && !type){
        return res.status(400).send('FAIL: Please enter a pokemon name or type.')
    }

    if(type){
        const pokemonByType = POKEDEX.pokemon.filter(pokeList => 
            pokeList.type.map(capitalizedType => 
                capitalizedType.toLowerCase()
                ).includes(type.toLowerCase()));

        if(pokemonByType < 1){
            return res.status(400).send('Check your spelling, or learn pokemon types at localhost8000:/types');
        }
        if(name){
            const pokemonByName = pokemonByType.filter(pokeList => 
                pokeList.name.toLowerCase().includes(name.toLowerCase()));
            return res.status(200).send(pokemonByName);
        }
        return res.status(200).send(pokemonByType);
    }

    if(name){
        const pokemonByName = POKEDEX.pokemon.filter(pokeList => 
            pokeList.name.toLowerCase().includes(name.toLowerCase()));

        if(pokemonByName.length > 1){
            return res.status(200).send(pokemonByName);
        }
        return res.status(400).send('SOFT FAIL: No pokemon foudn based on query.')
    }
};

app.get('/pokemon', handleGetPokemon);

app.use((error, req, res, next) => {
    let response
    if(process.env.NODE_ENV === 'production'){
        reponse = {error: {message: 'server error'}}
    }else{
        reponse = { error }
    }
    res.status(500).json(response);
})

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
});