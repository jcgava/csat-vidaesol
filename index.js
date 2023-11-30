require('dotenv').config();
const express = require('express');
const app = express();
const port = 3000;

const axios = require('axios');
const fs = require('fs');

const { conexao } = require('./models');

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.get('/', (req, res) => {
  console.log('process.env.USER_ID :>> ', process.env.CHATWOOT_URL);
  res.send('Hello');
});

app.post('/', async (req, res) => {
  const data = req.body;
  // console.log('data :>> ', JSON.stringify(data));
  // fs.readFileSync('sample.txt', 'utf8');
  // fs.appendFile(
  //   'sample.txt',
  //   '\n\n' + JSON.stringify(data),
  //   // callback function that is called after writing file is done
  //   function (err) {
  //     if (err) throw err;
  //     // if no error
  //     console.log('Data is written to file successfully.');
  //   }
  // );

  if (data.event === 'conversation_created') {
    const resultCon = await conexao.findOne({
      where: { remoteJid: data.meta.sender.identifier },
    });
    if (resultCon === null) {
      const uuid = await getConversationUuid(data.id);
      await conexao.create({
        remoteJid: data.meta.sender.identifier,
        conversation_id: uuid.id,
        conversation_uuid: uuid.uuid,
      });
    } else {
      // existe
      console.log(resultCon instanceof conexao); // true
      console.log('Conversation Created Existe: ', resultCon.remoteJid); // 'My Title'
    }
  } else {
    if (data.message_type === 'incoming') {
      const resultCon = await conexao.findOne({
        where: { remoteJid: data.sender.identifier },
      });
      if (resultCon === null) {
        // const uuid = await getConversationUuid(data.id);
        // await conexao.create({
        //   remoteJid: data.meta.sender.identifier,
        //   conversation_id: uuid.id,
        //   conversation_uuid: uuid.uuid,
        // });
        console.log('Null: ', resultCon instanceof conexao); // true
      } else {
        // existe
        console.log('Existe Incoming: ', resultCon.remoteJid); // 'My Title'
        if (
          resultCon.csat === 'input_csat' &&
          data.event !== 'message_updated'
        ) {
          await postCSAT(data.content, resultCon.conversation_uuid);
          await conexao.update(
            { csat: 'finish' },
            {
              where: {
                remoteJid: resultCon.remoteJid,
              },
            }
          );
          await postWebHookEvolution({
            number: resultCon.remoteJid,
            options: {
              delay: 1200,
              presence: 'composing',
              linkPreview: false,
            },
            textMessage: {
              text: 'Obrigado por avaliar.',
            },
          });
        }
      }
      // await postWebHookEvolutionChatwoot(data);
    }
    if (data.message_type === 'outgoing') {
      const resultCon = await conexao.findOne({
        where: { remoteJid: data.conversation.meta.sender.identifier },
      });
      if (resultCon === null) {
      } else {
        // existe
        console.log(resultCon instanceof conexao); // true
        console.log('Existe Outgoing: ', resultCon.remoteJid); // 'My Title'
        if (resultCon.csat !== 'finish') {
          await postWebHookEvolutionChatwoot(data);
        } else {
          if (data.content === 'Obrigado por avaliar.') {
            const uuid = await getConversationUuid(data.conversation.id);
            await conexao.update(
              {
                csat: '',
                conversation_id: data.conversation.id,
                conversation_uuid: uuid.uuid,
              },
              {
                where: {
                  remoteJid: data.conversation.meta.sender.identifier,
                },
              }
            );
          }
        }
      }
    }
    if (data.message_type === 'template') {
      if (
        data.content_type === 'input_csat' &&
        data.event !== 'message_updated'
      ) {
        await conexao.update(
          { csat: 'input_csat' },
          {
            where: {
              remoteJid: data.conversation.meta.sender.identifier,
            },
          }
        );
        await postWebHookEvolution({
          number: data.conversation.meta.sender.identifier,
          options: {
            delay: 1200,
            presence: 'composing',
            linkPreview: false,
          },
          textMessage: {
            text: 'Por favor, avalie esse atendimento:\n1 - Péssimo\n2 - Ruim\n3 - Regular\n4 - Bom\n5 - Ótimo',
          },
        });
      } else {
        await postWebHookEvolutionChatwoot(data);
      }
    }
  }

  res.send('Hello World!');
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

async function getConversationUuid(id) {
  let data = null;
  await axios
    .get('https://central.gava.dev.br/api/v1/accounts/1/conversations/' + id, {
      headers: {
        api_access_token: 'FBxAqDLFzrgSMY2y5Tdy9hXu',
      },
    })
    .then(function (response) {
      // handle success
      // console.log('resp: ', response);
      data = response.data;
    })
    .catch(function (error) {
      // handle error
      data = null;
      // console.log('err: ', error);
    })
    .finally(function () {
      // always executed
    });
  return data;
}

async function postWebHookEvolutionChatwoot(params) {
  await axios
    .post('https://whats.gava.dev.br/chatwoot/webhook/WhatsappGava', params, {
      headers: {
        apikey: 'c7cef13189230c6005a0e08f573afc4b',
      },
    })
    .then(function (response) {
      // handle success
      // console.log('resp: ', response.data);
    })
    .catch(function (error) {
      // handle error
      // console.log('err: ', error);
    })
    .finally(function () {
      // always executed
    });
}

async function postWebHookEvolution(params) {
  await axios
    .post('https://whats.gava.dev.br/message/sendText/WhatsappGava', params, {
      headers: {
        apikey: 'c7cef13189230c6005a0e08f573afc4b',
      },
    })
    .then(function (response) {
      // handle success
      // console.log('resp: ', response.data);
    })
    .catch(function (error) {
      // handle error
      // console.log('err: ', error);
    })
    .finally(function () {
      // always executed
    });
}

async function postCSAT(params, conversation) {
  await axios
    .put(
      'https://central.gava.dev.br/public/api/v1/csat_survey/' + conversation,
      {
        message: {
          submitted_values: {
            csat_survey_response: {
              rating: params,
              feedback_message: '',
            },
          },
        },
      }
    )
    .then(function (response) {
      // handle success
      // console.log('resp: ', response.data);
    })
    .catch(function (error) {
      // handle error
      // console.log('err: ', error);
    })
    .finally(function () {
      // always executed
    });
}
