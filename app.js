

var express = require('express');
var path = require('path');
var mysql2 = require('mysql2');
var app = express();
var router = express.Router();
var bodyParser= require('body-parser')
var fs = require('fs');



const { json, query } = require('express');
const { Console } = require('console');



const multer = require('multer')
const upload = multer({ dest: 'uploads/' });



app.set('view engine', 'ejs');
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
    extended:true
}));

app.use(express.static('public'));
//path.join() concatena los directorios
app.set('views', path.join(__dirname, 'views'));



//////////////////////////Configuracion de la api de google drive///////////////////////////
const {google} = require('googleapis');
const CLIENT_ID = '811575600397-v8r3l877h6sqnrr6sp1fk1ctfoa2ilvc.apps.googleusercontent.com';
const CLIENT_SECRET = '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';
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = '1//04IzZF9ZbuZrnCgYIARAAGAQSNwF-L9Ir52lF9MZuoOJVBUt2uo1VduV0pJNQ32ZizUFFFBneAjPavY2pifMOgkJg5KS6QAso20o';

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client
})


///////////////////////////////////////////////////////////////////////////////////////////////

////////////////////////////Configuracion de la coneccion de la base de datos//////////////////

var conexion = mysql2.createConnection({
  host: 'awsbases.cxwo0ysuswzn.us-east-1.rds.amazonaws.com',
  database: 'Ismybase',
  user: 'admin',
  password:'XDictamens'
});

///////////////////////////////////////////////////////////////////////////////////////////////

//para capturar los datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express(json));

//esto fuerza al browser a obtener una nueva copia de la pagina al clickear al regresar
app.use(function(req, res, next) {
  if (!req.user)
      res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  next();
});

/* GET home page. */
app.get('/', function(req, res, next) {
  conexion.query('SELECT * FROM usuario;',(err,respuesta)=>{
    if(err)throw err;
    res.render('index', {resp: respuesta});
  })
});




////////////////rutas de control de back end//////////////////

app.post('/agregarDB', upload.single('image'), async (req, res) => {
  var nombre = req.body.name;
  var descripcion = req.body.description;

  conexion.query('INSERT INTO usuario (nom_vd, des_vd) VALUES ("'+ nombre +'","'+ descripcion +'");', (err, resp) => {
    if (err) throw err;
  });

  res.redirect('/');
});

app.get('/eliminarDB/:id', (req, res) => {
  var id = req.params.id;
  conexion.query('DELETE FROM usuario WHERE (id_vd =' + id + ');', (err, resp) => {
    if (err) throw err;
  });
  res.redirect('/');
});

app.post('/editarDB', upload.single('image'), async (req, res) => {
  var id = req.body.id;
  var nombre = req.body.name;
  var descripcion = req.body.description;
  
  conexion.query('UPDATE usuario SET nom_vd = "'+ nombre +'", des_vd = "'+ descripcion +'" WHERE (id_vd = "'+ id +'");', (err, resp) => {
    if (err) throw err;
    res.redirect('/');
  });
});

app.get('/editar/:id', (req, res) => {
  var id = req.params.id;
  conexion.query('SELECT * FROM usuario WHERE (id_vd = "' + id + '")', (err, resp) => {
    if (err) throw err;
    console.log(resp[0].nom_vd);
    res.render('veditar', { resp: resp });
  });
});


//inicar servidor en el puerto 8080
app.use(express.static('public'));
app.listen(8080, ()=> {
    console.log('ya se corre en http://localhost:8080 7u7')
});




//responde a las solicitudes que no existen en la aplicacion
app.use((req, res, next)=>{
    res.status(404).render("404")
  })
  

 app.use(function(err, req, res, next) {
    
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    res.status(err.status || 500);
    res.render('error');
  }); 



module.exports = app;





