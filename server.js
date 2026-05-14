// api do gennus receba o node 
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();

// configuaraççao do workbanch = maldito
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'gennus_db',
    port: 3307
});

db.connect((err) => {
    if (err) {
        console.error('erro ao conectar ao mysql', err);
        return;
    }
    console.log('conectado graacas ao bom Deus')
});
app.use(express.static('public'));

// hora do esp32, nixon la ele 
app.get('/api/status-estoque', (req,res) =>{
    db.query('SELECT nome, qtd_estoque FROM produtos', (err, results) =>{
        if (err){
             return res.status(500).send(err);
        }     
         res.json(results);
    });
});



app.listen(3000, () =>{
    console.log('servidor rodando em http://localhost:3000');
});
