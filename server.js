// setting up nodejs app with express example.
const dotenv = require('dotenv').config();
const express = require('express');
const app = express();
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce');
const queryString = require('querystring');
const request = require('request-promise');
const { json } = require('express');

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scope = 'write_products';
const forwardingAddress = "https://649d00314f6c.ngrok.io"; //replace this with your forwarding address;

app.use(function (req, res, next) {
    res.setHeader('Content-Type', 'application/json');
    next();
})

// Unable to install the app at this point as the app was not reviewed by Shopify.
app.get('/shopify', (req, res) => {
    const shop = req.query.shop;
    if (shop) {
        const state = nonce();
        const redirectUri = forwardingAddress + '/shopify/callback';
        const installUrl = 'https://' + shop + '/admin/oauth/authorize?client_id=' + apiKey +
            '&scope=' + scope +
            '&state=' + state +
            '&redirect_uri=' + redirectUri;

        res.cookie('state', state)
        res.redirect(installUrl)
    } else {
        return res.status(400).send('missing shop parameter. Please add ?shop=rens-original-clone.myshopify.com to your request')
    }
})

// here lies another route for callback after hitting install

// --- ADJUSTING PRODUCT QUANTITY ---

// supposing customer purchases a size-8 pair of men stealth 
let secretURL = 'https://3863a238fbca56ad636bf296ead29bf0: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@rens-original-clone-1.myshopify.com/admin/api/2021-04'
app.post(
    `${secretURL}/inventory_levels/adjust.json`,
    jsonData,
    (req, res) => {

        let location_id = 63349096640;
        let men_stealth_8_id = 40046610940096;
        let women_stealth_9_id = 40046617067712

        // reduce size-9 women stealth (if possible) whenever customers buy a pair of size-8 men stealth
        // and vice versa
        let reqBody = req.body
        if (reqBody.inventory_item_id === men_stealth_8_id) {
            let jsonData = {
                "location_id": location_id,
                "inventory_item_id": women_stealth_9_id,
                "available_adjustment": -1
            }
            request(
                `${secretURL}/inventory_levels/adjust.json`,
                { json: jsonData }
            ).then(response => {
                if (response.status > 400) return res.send('Out of stock')
            })
        } else {
            let jsonData = {
                "location_id": location_id,
                "inventory_item_id": men_stealth_8_id,
                "available_adjustment": -1
            }
            request(
                `${secretURL}/inventory_levels/adjust.json`,
                { json: jsonData }
            ).then(response => {
                if (response.status > 400) return res.send('Out of stock')
            })
        }


    }
)

app.listen(3000, () => {
    console.log('App is running on port 3000')
})