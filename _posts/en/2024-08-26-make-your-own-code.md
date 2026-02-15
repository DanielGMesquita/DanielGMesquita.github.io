````---
layout: post
title: Write your own code
date: 2024-08-26 00:10 -0300
categories: [Programming, Studies]
tags: [programming, code, studies, node, javascript]
lang: en
---
At the beginning of my programming studies, I was one of several cases who followed courses where the instructor writes the code and teaches things while the student replicates.

I think this type of methodology has its value, but it depends a lot on the student.

I spent almost a year without accessing any material and studying in this format. I'm currently in a college subject where the final project consists of a medical appointment management application, involving doctor, patient, appointment and prescription entities. Nothing very complex. Back-end in Node. Nothing very complex.

And because it doesn't seem complex, the student can fall into the trap of just copying the teacher's code, without putting their mark there. After so long without following material in this format, today I feel extremely uncomfortable watching someone write code. I'll give an example to explain what I've been doing. The print below is from the original code of the subject, from the Appointment entity:

```javascript
import { mongoose } from "mongoose";
import Pacient from "./Pacient.js";
import Doctor from "./Doctor.js";

const Schema = mongoose.Schema;

const appointmentSchema = new Schema ({
    date: {
        type: Date,
        required: [true, 'Appointment Date is required.']
    },
    doctorId: {
        type: String,
        required: [true, 'DoctorId is required.'],
        validate: {
            validator: function (v){
                const id = new mongoose.Types.ObjectId(v); // converting a string to an ID object to be found in the database
                return Doctor.exists({_id: id});
            },
            message: props =>
             `DoctorID ${props.value} not found.` 
        }
    },
    pacientId: {
        type: String,
        required: [true, 'PacientId is required.'],
        validate: {
            validator: function (v){
                const id = new mongoose.Types.ObjectId(v); // converting a string to an ID object to be found in the database
                return Pacient.exists({_id: id});
            },
            message: props =>
             `PacientID ${props.value} not found.` 
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const appointment = mongoose.model('Appointment', appointmentSchema);

export default appointment;
```

You can notice that there is code repetition to perform validation of fields using the same logic. I'm very critical of repeated code, so I created a utils for validations and cleaned up the entity a bit:

```javascript
import mongoose from "mongoose";
import Doctor from "./Doctor.js";
import Pacient from "./Pacient.js";
import { validateId, idValidationMessage } from './utils/validators.js';

const Schema = mongoose.Schema;

const appointmentSchema = new Schema ({
    date: {
        type: Date,
        required: [true, 'Appointment date is required'],
    },
    doctorId: {
        type: String,
        required: [true, 'Doctor ID is required'],
        validate: {
            validator: function (v) {
                return validateId(v, mongoose, Doctor);
            },
            message: idValidationMessage,
        }
    },
    pacientId: {
        type: String,
        required: [true, 'Pacient ID is required'],
        validate: {
            validator: function (v) {
                return validateId(v, mongoose, Pacient);
            },
            message: idValidationMessage,
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});

const appointment = mongoose.model('Appointment', appointmentSchema);

export default appointment;
```

Another change I had to make to improve code quality was in the repositories and controllers. Initially the repository to include a new item in the database needed to receive an object with all the fields of that entity to do the inclusion logic. This is not wrong, what's strange is having this declared directly in all the code, as below:

```javascript
import Doctor from "../models/Doctor.js"

const getAllDoctors = async () => {
    try{
        return await Doctor.find();
    }catch(error){
        throw new Error(error);
    }
}

const getDoctor = async (id) => {
    try{
        return await Doctor.findById(id);
    }catch(error){
        throw new Error(error);
    }
}

const saveDoctor = async ({ name, login, password, medicalSpecialty, medicalRegistration, email, phone }) => {
    try{
        const doctor = new Doctor({ name, login, password, medicalSpecialty, medicalRegistration, email, phone });
        return await doctor.save();
    }catch(error){
        throw new Error(error);
    }
}

const updateDoctor = async (id, { name, login, password, medicalSpecialty, medicalRegistration, email, phone }) => {
    try{
        return await Doctor.findByIdAndUpdate(id, { name, login, password, medicalSpecialty, medicalRegistration, email, phone }, { new: true });
    }catch(error){
        throw new Error(error);
    }

}

const deleteDoctor = async (id) => {
    try{
        return await Doctor.findByIdAndDelete(id);
    }catch(error){
        throw new Error(error);
    }
}

// login
const getDoctorByLogin = async (login) => {
    try {
        return await Doctor.findOne({"login": login});
    } catch (error) {
        throw new Error(error);
    }
}

const doctorRepository = {
    getAllDoctors,
    getDoctor,
    saveDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorByLogin
}

export default doctorRepository;
```

I also "hid" all the logic of building the object that will be sent to the database in a separate function. This way the repository is "cleaner" and doesn't need to have the same object building logic for all fields.

```javascript
import Doctor from "../models/Doctor.js"
import { buildDoctorData } from "../utils/BuildDataUtils.js"

const getAllDoctors = async () => {
    return await Doctor.find();
}

const getDoctor = async (id) => {
    try {
        return await Doctor.findById(id);
    } catch (error) {
        throw new Error(error);
    }
}

const saveDoctor = async (data) => {
    try {
        const doctor = new Doctor(buildDoctorData(data));
        return await doctor.save();
    } catch (error) {
        throw new Error(error);
    }
}

const updateDoctor = async (id, data) => {
    try{
        return await Doctor.findByIdAndUpdate(id, buildDoctorData(data), { new: true });
    }catch(error){
        throw new Error(error);
    }

}

const deleteDoctor = async (id) => {
    try {
        return await Doctor.findByIdAndUpdate(id);
    } catch (error) {
        throw new Error(error);
    }
}

const getDoctorByLogin = async (login) => {
    try {
        return await Doctor.findOne({"login": login});
    } catch (error) {
        throw new Error(error);
    }
}

const doctorRepository = {
    getAllDoctors,
    getDoctor,
    saveDoctor,
    updateDoctor,
    deleteDoctor,
    getDoctorByLogin
}

export default doctorRepository;
```

Another relevant edit I made was in the controllers. All use express router to make calls. All controllers basically have the same routes for each entity. The original didn't include cases for entities not found in the database, just as all routes used a try/catch block to capture and pass errors forward:

```javascript
import express from "express";
import AppointmentService from "../services/AppointmentService.js";

let router = express.Router();

router.get('/appointments', async(req, res) => {
    try {
        const appointments = await AppointmentService.getAllAppointments();
        res.send(appointments);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.get('/getAppointment/:id', async(req, res) => {
    const {id} = req.params;
    try {
        const appointment = await AppointmentService.getAppointment(id);
        res.send(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.post('/postAppointment', async(req, res) => {
    const {date, doctorId, pacientId} = req.body;
    try {
        const appointment = await AppointmentService.saveAppointment({date, doctorId, pacientId});
        res.send(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.put('/appointments/:id', async(req, res) => {
    const {id} = req.params;
    const {date, doctorId, pacientId} = req.body;
    try {
        const appointment = await AppointmentService.updateAppointment(id, {date, doctorId, pacientId});
        res.send(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.delete('/appointments/:id', async(req, res) => {
    const {id} = req.params;
    try {
        const appointment = await AppointmentService.deleteAppointment(id);
        res.send(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
});

router.put('/reschedule/:id', async(req, res) => {
    const {id} = req.params;
    const {date} = req.body;
    try {
        let appointment = await AppointmentService.getAppointment(id);
        appointment.date = date;

        appointment = await AppointmentService.updateAppointment(id, {date});
        res.send(appointment);
    } catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}

);

export default router;
```

So I created an asyncHandler for this guy:

```javascript
export const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

What I decided to do was use an express utility middleware to handle asynchronous functions more elegantly, automating route handling:
1 - The "fn" is an asynchronous function that I want to execute, with the signature (req, res, next) that can return a Promise;
2 - The asyncHandler returns a new function that receives the same parameters as "fn";
3 - Promise.resolve() is used to ensure that the return of "fn" is treated as a promise, even if "fn" doesn't return an explicit promise (like a synchronous function, for example);
4 - In the case of ".catch(next)" if the promise returned by "fn" is rejected (that is, if an error occurs inside "fn"), the .catch(next) captures that error and passes it to Express's error handling middleware (calling the next function with the error as an argument).

```javascript
import express from "express";
import AppointmentService from "../services/AppointmentService.js";
import { buildAppointmentData } from "../utils/BuildDataUtils.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { errorHandler } from "../utils/ErrorHandler.js";

let router = express.Router();

const notFoundErrorMessage = 'Appointment not found';

router.get('/appointments', asyncHandler(async (req, res) => {
    const appointments = await AppointmentService.getAllAppointments();
    res.json(appointments);
}));

router.get('/appointments/getAppointment/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const appointment = await AppointmentService.getAppointment(id);
    if (appointment) {
        res.json(appointment);
    } else {
        res.status(404).json({ error: notFoundErrorMessage });
    }
}));

router.post('/appointments/createAppointment', asyncHandler(async (req, res) => {
    const data = req.body;
    const appointment = await AppointmentService.saveAppointment(buildAppointmentData(data));
    res.status(201).json(appointment);
}));

router.put('/appointments/updateAppointment/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const updatedAppointment = await AppointmentService.updateAppointment(id, buildAppointmentData(data));
    if (updatedAppointment) {
        res.json(updatedAppointment);
    } else {
        res.status(404).json({ error: notFoundErrorMessage });
    }
}));

router.delete('/appointments/deleteAppointment/:id', asyncHandler(async (req, res) => {
    const { id } = req.params;
    const deletedAppointment = await AppointmentService.deleteAppointment(id);
    if (deletedAppointment) {
        res.json(deletedAppointment);
    } else {
        res.status(404).json({ error: notFoundErrorMessage });
    }
}));

router.put('/appointments/rescheduleAppointment/:id', async(req, res) => {
    const {id} = req.params;
    const {date} = req.body;
    let appointment = await AppointmentService.getAppointment(id);

    if (!appointment) {
        return res.status(404).json({ error: notFoundErrorMessage })
    }

    const rescheduleAppointment = await AppointmentService.updateAppointment(id, {date});

    res.json(rescheduleAppointment);
});

router.use(errorHandler);

export default router;
```

In this case the asyncHandler simplifies the code, removing the need for several try/catch blocks and manages errors in a way that allows Express to handle them centrally.

Today with some time working in the market, I always try to implement improvements that increase code quality, facilitate its maintenance and make it scalable and easy to understand, even in study projects. And I don't do this after "delivering the activity". I do it during the code construction, as soon as I get the idea of what needs to be done, I analyze what can be improved and apply it.

The same goes for those who still don't have professional experience, even in studies, the person starts to develop some skills that help to get out of goHorseX. It's very important for learning to have autonomy and initiative when developing study projects because you will NEVER learn that if you just keep copying what the instructor is coding.

Try, apply improvements, create other features, formulate hypotheses, have a critical view to seek improvements, break your application, read the logs and the console, deal with real life. In real life, code that works nicely right away with everything well delivered is rare. And if you come across one like that, I suggest you be suspicious.

You'll only develop new skills if you expose yourself to new problems to be solved. And copying someone's code is definitely not a problem.

Cheers!
````