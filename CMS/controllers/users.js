const fetch = require("node-fetch");

exports.getUsers = (req, res, next) => {

    fetch("http://localhost:5003/api/users").then(res => res.json()).then(text => {
        res.users = text.data.users
        next()
    })
    
    
}