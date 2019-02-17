
const express = require('express')
const { check, validationResult } = require('express-validator/check')
const router = express.Router()
const { matchedData } = require('express-validator/filter')
var outputs = []

router.post('/contract', [
    check('message')
        .isLength({ min: 1 })
        .withMessage('Message is required')
        .trim()
], (req, res) => {myFunction(req, res)})

function findKeyThings(text) {
    if (text.includes('reserve') && text.includes('right')) {
        return "This deals with you giving up rights of your material to the entity";
    } else if (text.includes('liability') || text.includes('risk') || text.includes('liable') || text.includes('responsib') || text.includes('guarantee')) {
        return "This deals with the entity's liability for your harm";
    } else if (text.includes('harm') || text.includes('death') || text.includes('offensive') || text.includes('hate') || text.includes('abus')) {
        return "This deals with potential danger to the user";
    } else if (text.includes('cost ') || text.includes('consum') || text.includes('sale') || text.includes('purchas') || text.includes('bill ') || text.includes('pay ') || text.includes('charge ') || text.includes('fee ')) {
        return "This deals with financial costs from the entity onto the user";
    } else if (text.includes('release')) {
        return "This deals with you giving up rights to your material to the entity";
    } else if (text.includes('privacy')) {
        return "This deals with you losing privacy because of the entity";
    } else if (text.includes('discriminat')) {
        return "This deals with the entity having discretionary rights";
    } else if (text.includes('terminate') || text.includes('end ')) {
        return "This deals with the entity's right upon the end of the contract";
    } else if (text.includes('decline')) {
        return "This deals with the entity's right to refuse something to you";
    } else if (text.includes('penalty')) {
        return "This deals with the entity penalizing you for certain behavior";
    } else if (text.includes('copy') || text.includes('property')) {
        return "This deals with the copyrights between you and the entity";
    } else if (text.includes('limit')) {
        return "This deals with the loss of privileges with the entity";
    } else {
        return null;
    }
}

async function myFunction(req, res) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.render('contract', {
            data: req.body,
            errors: errors.mapped()
        })
    }

    const data = matchedData(req)

// Imports the Google Cloud client library
    const language = require('@google-cloud/language');

// Creates a client
    const client = new language.LanguageServiceClient();
    const text = data.message;

// Prepares a document, representing the provided text
    const document = {
        content: text,
        type: 'PLAIN_TEXT',
    };

    // Detects the sentiment of the document
    const [result] = await client.analyzeSentiment({document});

    const sentences = result.sentences;
    sentences.forEach(sentence => {
        if (sentence.sentiment.magnitude > 0.8 && sentence.text.content[0].toLowerCase() != sentence.text.content[0].toUpperCase()) {
            let s = findKeyThings(sentence.text.content.toLowerCase())
            // if (s !== null && sentence.text.content[0].toUpperCase() == sentence.text.content[0]) {
                outputs.push([sentence.text.content, s])
            // }
        }
    });
    // [END language_sentiment_text]

    req.flash('success', `{<span class=\'highlight\'> Thanks for the message! I‘ll be in touch :</span>}`)
    res.redirect('/')
}


router.get('/', (req, res) => {
    res.render('index', {
        outs: outputs
    })
    outputs = []
})

router.get('/contract', (req, res) => {
    res.render('contract', {
        data: {},
        errors: {}
    })
})

module.exports = router
