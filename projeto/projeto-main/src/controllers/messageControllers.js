const asyncHandler = require("express-async-handler");
const express = require("express");
const Router = express.Router();
const fs = require('fs')
const { Configuration, OpenAIApi } = require("openai");

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(config);

async function upload() {
  try {
    const response = await openai.createFile(
      fs.createReadStream('./data.yssy.jsonl'),
      "fine-tune"
    );
    console.log('File ID: ', response.data.id)
    return response.data.id
  } catch (err) {
    console.log('err: ', err)
  }
}

async function createFineTune(FileID) {
  try {
    const response = await openai.createFineTune({
      training_file: FileID,
      model: 'davinci:ft-personal-2023-06-13-21-18-06'
    })
    console.log('response: ', JSON.stringify(response))
  } catch (err) {
    console.log('error: ', err)
  }
}

// @desc envio de mensagem para a IA
// @route POST /message

const send = asyncHandler(async (req, res) => {
  const { prompt, completion } = req.body;

  try {
    const response = openai.createCompletion({
      model: "davinci:ft-personal-2023-06-13-21-18-06",
      prompt: prompt,
      temperature: 0.2,
      frequency_penalty: 0,
      presence_penalty: 0,
      best_of: 1,
      max_tokens: 400,
      stop: ["END"]
    });

    response
      .then((data) => {
        const message = { message: data.data.choices[0].text };
        console.log(message)
        res.status(201).send(message);
      })
      .catch((err) => {
        res.send(err);
      });
  } catch (error) {
    console.error(error);
  }
});

// @desc cria o fine tune baseado no arquivo de treino enviado
// @route POST /createFineTune

/*const createFineTune = asyncHandler(async (req, res) => {
  const { fileID } = req.body

  try {
    const response = await openai.createFineTune({
      training_file: fileID,
      model: 'davinci',
    })
    console.log('response: ', response)
    res.status(201).send({ response: response })
  } catch (error) {
    console.error(error)
    res.status(400)
  }
})*/

// @desc treina o modelo baseado em um arquivo de treino
// @route POST /trainer

const trainer = asyncHandler(async (req, res) => {
  const result = req.body

  try {
    for (let i = 0; i < result.length; i++) {
      const prompt = result[i]['prompt'];
      const completion = result[i]['completion'];
      fs.appendFileSync("data.yssy.jsonl", JSON.stringify({ prompt, completion }) + "\n");
    }

    const fileID = await upload()
    console.log(fileID)
    await createFineTune(fileID)
    res.status(200).send({ message: `Training example saved. ${fileID}` });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error saving training example." });
  }
});

// @desc lista todos os fines tunes criados
// @route GET /listFineTunes

const listFineTunes = asyncHandler(async (req, res) => {
  try {
    const response = await openai.listFineTunes()
    res.status(200).send({ message: response.data.data })
  } catch (error) {
    console.error(error)
  }
})

// @desc lista os eventos de um determinado fine tune
// @route GET /listFineTuneEvents

const listFineTuneEvents = asyncHandler(async (req, res) => {
  const { id } = req.body

  try {
    setInterval(() => {
      const response = openai.listFineTuneEvents(id, false)
      response.then((data) => {
        console.log(data.data.data);
      }).catch((error) => {
        console.log(error)
        res.status(500).send({ message: 'Error' })
      })

    }, 5000)
  } catch (error) {
    console.error(error)
  }
})


// @desc deleta um fine tune
// @route delete /deleteFineTune

const deleteFineTune = asyncHandler(async (req, res) => {
  const { model } = req.body
  console.log('Modelo ', model)
  try {
    const response = await openai.deleteModel(model);
    console.log('response ', response)
    res.status(200).send({ message: 'Modelo deletado' })
  } catch (error) {
    console.error(error)
  }
})

// @desc realiza o upload do arquivo de treino
// @route POST /uploadFile

/*const uploadFile = asyncHandler(async (req, res) => {
  try {
    const response = await openai.createFile(
      fs.createReadStream('././data.yssy_prepared.jsonl'),
      "fine-tune"
    );
    res.status(200).send({ fileID: response.data.id })
  } catch (error) {
    console.error(error)
    res.status(400)
  }
})*/

module.exports = {
  send,
  trainer,
  //createFineTune,
  listFineTunes,
  listFineTuneEvents,
  deleteFineTune,
  //uploadFile
};
