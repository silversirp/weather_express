const express = require('express')
const app = express()
const path = require('path')
const fetch = require('node-fetch')
const bodyParser = require('body-parser');
const url = require("url");
const {response} = require("express");

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

const key = 'ee91cb438af3ec838d3c334f3d56c61c';
const getWeatherDataPromise = (url) => {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then(response => {
                return response.json()
            })
            .then(data => {
                let description = data.weather[0].description
                let city = data.name
                let temp = Math.round(parseFloat(data.main.temp)-273.15)
                let result = {
                    description: description,
                    city: city,
                    temp: temp,
                    error: null
                }
                resolve(result)
            })
            .catch(error => {
                reject(error)
            })
    })
}

app.all('/', function (req, res) {
    let city
    if(req.method == 'GET'){
        city = 'Tartu'
    }
    if(req.method == 'POST'){
        city = req.body.cityname
    }
    let url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${key}`
    getWeatherDataPromise(url)
        .then((data) => {
            res.render('index', data)
        })
        .catch(error => {
            let errorMessage
            if(city === ''){
                errorMessage = 'City name empty, please fill in a correct city name'
            } else {
                errorMessage = 'Problem with getting data, try again'
            }
            res.render('index', {error: errorMessage})
        })
})

app.listen(3000)