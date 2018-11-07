var express = require('express');
var router = express.Router();
var async = require('async');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
var Room = require('../database/chat_room_schema');
var Chat = require('../database/chat_contents_schema');
var LOADING_SIZE = 20;

//room/chat/user_nickname
var getChatUserNickName = async function (req, res, next) {
    console.log("getChatUserNickName호출됨")
    var userNickName = req.params.user_nickname;
    var current_page = req.query.current_page || 0;
    var database = req.app.get('database');
    var start_page = current_page * LOADING_SIZE;
    console.log("찾으려는 유저 닉네임값 : " + userNickName);

    console.log("요청하려는 스타트페이지 : " + start_page);
    try {
        //database.Room.find({})..~~여기서 직접해줘도 왜 안드로이드에서 골뱅이로 받는거지..

        await database.Room.findByuserNickName(userNickName, start_page, LOADING_SIZE,
            function (err, results) {

                if (err) {

                    console.error('에러내용 : ' + err.stack);
                    res.end();
                    return;
                }
                console.log("getChatUserNickName결과값 : " + JSON.stringify(results));
                res.status(200).json(results);
            });
    } catch (error) {
        console.error(error);
        next(error);
    }
}



var get_room_start = async function (req, res, next) {
    var database = req.app.get('database');
    try {
        const rooms = await database.Room.find({});
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
    var database = req.app.get('database');
    console.log("에러? : " + req.body.title + "//" + req.body.max + "//" + req.session.color + "//" + req.body.password);
    try {
        const room = new database.Room({
            title: req.body.title,
            max: req.body.max,
            owner: req.body.nickname,
            password: req.body.password,
            participant: req.body.participant
        });
        const newRoom = await room.save();
        const io = req.app.get('io');

        console.log("참가자 : " + req.body.participant);
        io.of('/room').to(req.body.participant).emit('newRoom', newRoom); //채팅개설자가 나일때
        //else io.of('/room').to(req.body.nickname).emit('newRoom', newRoom);//채팅개설자가 내가아닐때

        res.redirect(`/room/${newRoom._id}?password=${req.body.password}`);
    } catch (error) {
        console.error(error);
        next(error);
    }
}

var get_room_id = async function (req, res, next) {
    console.log("get_room_id호출..")
    var database = req.app.get('database');
    try {
        const room = await database.Room.findOne({
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
        const chats = await database.Chat.find({
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
    var database = req.app.get('database');
    try {
        await database.Room.remove({
            _id: req.params.id
        });
        await database.Chat.remove({
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
    var database = req.app.get('database');
    var sender = "";
    var receiver ="";
    try {

        console.log("채팅전송시작 " + req.params.id + "//" + req.body.user + "//" + req.body.chat);
        if (req.body.sender == null) sender = "qwer"; //nickName = "비회원";
        else sender = req.body.sender;

        if (req.body.receiver == null) receiver = "asdf"; //인터넷상에서 리시버랑 센더어케하는지모르겠어서 우선이렇게임시방편
        else receiver = req.body.receiver;
        
        
        var chat = new database.Chat({
            room: req.params.id,
            sender: sender,
            receiver: receiver,
            chat: req.body.chat
        });
        await chat.save();
        console.log("보낼 req.params.id값 : " + req.params.id + "chat값 : " + chat)
        req.app.get('io').of('/chat').to(req.params.id).emit('chat', chat);
        res.send('ok');
    } catch (error) {
        console.error(error);
        next(error);
    }
}
var get_room_android_id = async function (req, res, next) {
    console.log("room/android/:id호출..")
    var database = req.app.get('database');
    try {
        const room = await database.Room.findOne({
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
        const chats = await database.Chat.find({
            room: room._id
        }).sort('createdAt');
        res.status(200).json(chats);
        /*        return res.render('chat', {
                    room,
                    title: room.title,
                    chats,
                    user: req.session.color,
                });*/
    } catch (error) {
        console.error(error);
        return next(error);
    }
}

module.exports.getChatUserNickName = getChatUserNickName;
module.exports.get_room_android_id = get_room_android_id;
module.exports.post_room_id_chat = post_room_id_chat;
module.exports.delete_room_id = delete_room_id;
module.exports.get_room_id = get_room_id;
module.exports.post_room = post_room;
module.exports.get_room_start = get_room_start;
module.exports.get_room = get_room;
