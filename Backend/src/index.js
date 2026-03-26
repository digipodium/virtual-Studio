const express = require('express');
const authRoutes = require('./router/authRoutes');
const connectDB = require('./connection');
const cors = require('cors');
connectDB();
const app = express();
const port = 5000;

//middleware
app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);

//root or endpoint
app.get('/',(req, res) =>{
    res.send('response from express')

});
app.get('/add', (req, res) =>{
    res.send('response from add');
})

//getall
app.get('/getall', (req, res) =>{
    res.send('response from getall');

});

//getbyid

app.get('/getById', (req, rea)=>{
    res.send('response from getbyid')
});
//getbyemail
app.get('/getbyemail', (req, res)=>{
    res.send('response from getbyemail')
});
//delete

app.get('/delete', (req, res) =>{
    res.send('response from delete')
})
//update
app.get('/update', (req, res) =>{
    res.send('response from update')
});
app.listen(port, () =>{
    console.log(`server started ${port}`);
});
