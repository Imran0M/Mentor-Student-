const bodyParser = require('body-parser');
const express = require('express')
const mongoose= require('mongoose')
// const params = require('params');
const Mentor= require('./Models/mentor')
const Student= require('./Models/student')
require('dotenv').config()
const app = express();
app.use(bodyParser.json())
const PORT= process.env.PORT;

// DataBase connection
const DB_url= process.env.DB_url
mongoose.connect(DB_url,{})
.then(()=>{console.log('Data Base connected')})
.catch((err)=>{console.log('DB connection Failled',err)})

//API to create a mentor

app.post('/postMentor', async (req,res)=>{
    try {
        const mentor = new Mentor(req.body)
        await mentor.save()
        res.status(200).send(mentor)
    } catch (error) {
        res.status(400).send(error.message)
    }
})

// API to create a Student

app.post('/poststudent',async(req,res)=>{
    try {
        const studen = new Student(req.body)
        await studen.save()
        res.status(200).send(studen)
    } catch (error) {
        res.status(500).send('error in creating a student')
    }
  
})

// API TO assign student to mentor
app.post('/mentor/:mentorID/assign', async(req,res)=>{
    try {
    const mentor= await Mentor.findById(req.params.mentorID)
    const students = await Student.find({_id:{$in: req.body.students}})

    students.forEach((student)=>{
       student.currentMentor = mentor._id
       student.save()
    })
    mentor.students=[
        ...mentor.students,
        ...students.map(stud => stud._id)  
    ];
    await mentor.save()
    res.send(mentor)
    } catch (error) {
        
    }
    
})

// update the mentor and student.select One Student and Assign one Mentor

app.put('/student/:studentID/assignMentor/:mentorID', async(req,res)=>{
    try {
        const mentor = await Mentor.findById(req.params.mentorID)
        const student = await Student.findById(req.params.studentID)

        if( student.currentMentor){
            student.previousMentor.push(student.currentMentor)
        }
        student.currentMentor = mentor._id
        student.save()
        res.send(student)
    } catch (error) {
        res.status(500).send(error.message)
    }
   
})

//show all students for a particular mentor

app.get('/mentor/:id/students', async(req,res)=>{
    try {
        const result =await Mentor.findById(req.params.id).populate('students')
        res.send(result)
    } catch (error) {
        res.status(500).send(error.message)
    } 
})

//show the previously assigned mentor for a particular student.

app.get('/previousMentor/:id/students', async(req,res)=>{
    try {
        const results = await Student.findById(req.params.id).populate()
        res.send(results)
    } catch (error) {
        res.status(500).send(error.message)
    }
})

// listen the app server
app.listen(PORT, ()=>{
    console.log('The App is running on', PORT)
})