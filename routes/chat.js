var express = require('express');
var router = express.Router();
var async = require('async');
const Room = require('../database/chat_room_schema');
const Chat = require('../database/chat_contents_schema');

var get_room_start = async function (req, res, next) {
    try {
        const rooms = await Room.find({});
        res.render('main', {
            rooms,
            title: 'GIF 채팅방',
            error: req.flash('roomError')
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}
var get_room = function (req, res) {
    res.render('room', {
        title: 'GIF 채팅방 생성'
    });
}
var post_room = async function (req, res, next) {
    try {
        const room = new Room({
            title: req.body.title,
            max: req.body.max,
            owner: req.session.color,
            password: req.body.password,
        });
        const newRoom = await room.save();
        const io = req.app.get('io');
        io.of('/room').emit('newRoom', newRoom);
        res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

var get_room_id = async function (req, res, next) {
    try {
        const room = await Room.findOne({
            _id: req.params.id
        });
        const io = req.app.get('io');
        if (!room) {
            req.flash('roomError', '존재하지 않는 방입니다.');
            return res.redirect('/');
        }
        if (room.password && room.password !== req.query.password) {
            req.flash('roomError', '비밀번호가 틀렸습니다.');
            return res.redirect('/');
        }
        const {
            rooms
        } = io.of('/chat').adapter;
        if (rooms && rooms[req.params.id] && room.max <= rooms[req.params.id].length) {
            req.flash('roomError', '허용 인원이 초과하였습니다.');
            return res.redirect('/');
        }
        const chats = await Chat.find({
            room: room._id
        }).sort('createdAt');
        return res.render('chat', {
            room,
            title: room.title,
            chats,
            user: req.session.color,
        });
    } catch (error) {
        console.error(error);
        return next(error);
    }
}

var delete_room_id = async function (req, res, next) {
    try {
        await Room.remove({
            _id: req.params.id
        });
        await Chat.remove({
            room: req.params.id
        });
        res.send('ok');
        setTimeout(() => {
            req.app.get('io').of('/room').emit('removeRoom', req.params.id);
        }, 2000);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

var post_room_id_chat = async function (req, res) {
    try {
        const chat = new Chat({
            room: req.params.id,
            user: req.session.color,
            chat: req.body.chat,
        });
        await chat.save();
        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
}


module.exports.post_room_id_chat = post_room_id_chat;
module.exports.delete_room_id = delete_room_id;
module.exports.get_room_id = get_room_id;
module.exports.post_room = post_room;
module.exports.get_room_start = get_room_start;
