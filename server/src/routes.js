'use strict';

var express = require('express');
var router = express.Router();

var thing = require('./thing/thing.controller');
var reply = require('./reply/reply.controller');
var topic = require('./topic/topic.controller');
var userHandlers = require('./user/user.controller.js');
// topics ressources

router.get('/api/things', thing.find);
router.get('/api/things/:id', thing.get);
router.post('/api/things', thing.post);
router.put('/api/things/:id', thing.put);
router.put('/api/test/', thing.test);

router.get('/api/topics', topic.find);
router.get('/api/topics/:id', topic.get);
router.post('/api/topics', topic.post);
router.put('/api/topics/:id', topic.put);
router.post('/api/topics/:id/replies', topic.reply);
router.post('/api/topics/upload/', topic.upload);

router.post('/auth/register', userHandlers.register);
router.post('/auth/register/upload/', userHandlers.upload);
router.post('/auth/sign_in', userHandlers.sign_in);
router.get('/api/user/getInfo', userHandlers.getInfo);
router.get('/api/user/getMesaage', userHandlers.getMessage);
router.post('/api/user/visited', userHandlers.visited);
router.post('/api/reply/ups', userHandlers.ups);

router.get('/api/replies/:id', reply.find);

module.exports = router;
