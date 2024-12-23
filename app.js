const express = require('express');
const app = express();
const path = require('path');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const session = require('express-session');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const User=require("./models/login");
require("./configuration/autentication")(passport);


// Middleware para processar dados do formulário
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração de sessão
app.use(session({
  secret: 'chave_secreta',
  resave: false,
  saveUninitialized: true,
}));
//////////////////////////////////////////////////////
//////////////////////////////////////////////////////
/////////////////////////////////////////////////////

// Middleware para verificar se o usuário está autenticado
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

app.get("/login",(req,res)=>{
  res.render("login", { error: null });
  });

// Rota para processar o login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ where: { username } });
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (isMatch) {
        req.session.userId = user.id;
        req.session.username = user.username;
        return res.redirect('/admin');
      }
    }
    res.render('login', { error: 'Usuário ou senha inválidos' });
  } catch (err) {
    res.render('login', { error: 'Erro ao processar login' });
  }
});

// Rota para exibir o formulário de registro
app.get('/register', (req, res) => {
  res.render('register', { error: null });
});

// Rota para processar o registro
app.post('/register', (req, res) => {
  //const { username, password } = req.body;
 User.create(
    username=req.body.username,
    password=req.body.password
  ).then((req,res)=>{
    console.log("registro FEITA COM SUCESSO");
    res.redirect("admin/admin-dashboard");
}).catch((req,res)=>{
    console.log("FALHA AO FAZER registro");
 
});
 /* try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, password: hashedPassword });
    req.session.userId = newUser.id;
    req.session.username = newUser.username;
    res.redirect('/login');
  } catch (err) {
    res.render('register', { error: 'Erro ao criar usuário' });
  }*/
});

// Rota para logout
app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});



////////////////////////////////////////////
//////////////////////////////////////////////
///////////////////////////////////////////
/////////////////////////////////



// Middleware para mensagens flash
app.use(flash());
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  next();
});

// Inicializar Passport e sessões
app.use(passport.initialize());
app.use(passport.session());

// Rotas
const userRoutes = require('./routes/userroutes');
const adminRoutes = require('./routes/adminroutes');

// Configurar o motor de template EJS
app.set('view engine', 'ejs');
//app.use(express.static('public')); 

// Configuração de arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, 'views'));

// Middleware para parsing de dados do formulário
//app.use(express.urlencoded({ extended: true }));


app.use('/admin', adminRoutes);
app.use('/user', userRoutes);

// Middleware para tratar rotas não encontradas
app.use((req, res, next) => {
  res.status(404).render('404', { url: req.url });
});

// Middleware para tratar erros internos do servidor
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Algo deu errado!');
});

// Inicializando servidor
const PORT =3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
