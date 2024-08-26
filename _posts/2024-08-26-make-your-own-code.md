---
layout: post
title: Faça seu próprio código
date: 2024-08-26 00:10 -0300
categories: [Programação, Estudos]
tags: [programação, código, estudos, node, javascript]  
---
No começo dos meus estudos em programação, eu fui um dos vários casos que acompanhou cursos onde o instrutor vai escrevendo o código e ensinando as coisas enquanto o aluno vai replicando.

Eu acho que esse tipo de metodologia tem seu valor, mas depende muito do aluno.

Passei quase um ano sem acessar nenhum material e estudar nesse formato. Atualmente estou em uma disciplina na faculdade que o projeto final consiste em uma aplicação de gestão de consultas médicas, envolvendo entidades médico, paciente, consulta e receita. Nada muito complexo. Back-end em Node. Nada muito complexo.

E por não parecer complexo, o aluno pode cair na cilada de sair só copiando código do professor, sem ir colocando sua marca ali. Depois de tanto tempo sem acompanhar um material nesse formato, hoje eu me sinto extremamente incomodado em ficar assistindo alguém escrever código. Vou dar um exemplo pra explicar o que eu tenho feito. O print abaixo é do código original da disciplina, da entidade Appointment:

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
                const id = new mongoose.Types.ObjectId(v); // convertendo uma string em objeto ID para ser encontrado no banco
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
                const id = new mongoose.Types.ObjectId(v); // convertendo uma string em objeto ID para ser encontrado no banco
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

Você pode notar que existe uma repetição de código para realizar a validação de campos utilizam a mesma lógica. Eu sou muito crítico com código repetido, então criei um utils para validações e limpei um pouco a entidade:

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

Outra mudança que eu tive que fazer para melhorar a qualidade do código foi nos repositories e controllers. Inicialmente o repository para incluir um novo item no banco, precisava receber um objeto com todos os campos daquela entidade para fazer a lógica de inclusão. Isso não é o errado, o que fica estranho é ter isso declarado diretamente em todo o código, como abaixo:

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

Eu também "escondi" toda a lógica de construção do objeto que será enviado para o banco em uma função separada. Assim o repository fica mais "limpo" e não precisa ter a mesma lógica de construção de objeto para todos os campos.

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

Uma outra edição relevante que fiz foi nos controllers. Todos utilizam o router do express para fazer as chamadas. Todos os controllers tem basicamente as mesmas rotas apra cada entidade. O original não incluía casos para entidades não encontradas no banco, assim como todos as rotas utilizavam um blco try/catch para capturar e passar os erros adiante:

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

Então criei um asyncHandler para esse cara:

```javascript
export const asyncHandler = fn => (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);
```

O que eu decidi fazer foi utilizar um middleware de utilitário do express para lidar com funções assíncronas de maneira mais elegante, automatizando os tratamentos das rotas:
1 - O "fn" é uma função assíncrona que eu desejo executar, com a assinatura (req, res, next) que pode retornar uma Promise;
2 - O asyncHandler retorna uma nova função rque recebe os mesmos parâmetros que "fn";
3 - Promise.resolve() é utilizado para que garantir que o retorno de "fn" seja tratado como uma promessa, mesmo se "fn" não retornar uma promise explícita (como uma função síncrona, por exemplo);
4 - No caso do ".catch(next)" se a promessa retornada por "fn" for rejeitada (ou seja, se um erro ocorrer dentro de "fn"), o .catch(next) captura esse erro e o passa para o middleware de tratamento de erros do Express (chamando a função next com o erro como argumento).

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

Neste caso o asyncHandler simplifica o código, retirando a necessidade de vários blocos try/catch e gerencia os erros de maneira que permita que o Express trate-os de maneira centralizada.

Hoje com algum tempo de atuação no mercado, eu já tento sempre implantar melhorias que aumentem a qualidade de código, facilite sua manutenção e torne escalável e fácil de entender, mesmo em projetos de estudo. E eu não faço isso depois de "entregar a atividade". Eu faço durante a construção do código, assim que pego a ideia do que precisa ser feito, analiso o que pode melhorar e aplico.

O mesmo vale pra quem ainda não tem experiência profissional, mesmo nos estudos, a pessoa começa a desenvolver algumas habilidades que ajudam a sair do goHorseX. É muito importante para o aprendizado ter autonomia e iniciativa ao desenvolver projetos de estudos porque você NUNCA vai aprender aquilo se ficar só copiando o que o instrutor está codando.

Tente, aplique melhorias, crie outras features, formule hipóteses, tenha visão crítica para buscar melhorias, quebre sua aplicação, leia os logs e o console, vá tratando com a vida real. Na vida real, um código que já sai funcionando bonitinho de cara com tudo bem entregue é coisa rara. E se você se deparar com algum assim, sugiro desconfiar.

Você só vai desenvolver novas habilidades se você se expor a novos problemas a serem resolvidos. E copiar código de alguém definitivamente não é um problema.

Abraço!
