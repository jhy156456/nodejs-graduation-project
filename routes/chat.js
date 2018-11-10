var express = require('express');
var router = express.Router();
var async = require('async');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
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
                //console.log("getChatUserNickName결과값 : " + JSON.stringify(results));
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
    //상대방(안드로이드기기에서 나가기버튼)이나가기버튼 클릭 후 인터넷으로 다시 메시지보낼때 owner가 정해지지않는다!!
    try {
        var room = new database.Room({
            title: req.body.title,
            max: req.body.max,
            owner: req.body.nickname,
            password: req.body.password,
            participant: req.body.participant,
            participant_count: 2
        });
        var newRoom = await room.save();
        var io = req.app.get('io');

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
    console.log("get_room_id호출")
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
        var chats = await database.Chat.find({
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
var getParticipant = async function (req, res, next) {
    var database = req.app.get('database');
    var results;
    try {
        results = await database.Room.find({
            _id: req.params.id
        });
        console.log("참가자 수" + results[0]._doc.participant_count)
        res.status(200).send('' + results[0]._doc.participant_count);
        /*        res.status(200).send(results[0]._doc.participant_count); 로 보내면
                express deprecated res.send(status): Use res.sendStatus(status) instead routes\chat.js:152:25
        _http_server.js:208 에러가남
        --> 그래서 ''+로보냈음!!
        */
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
    var receiver = "";
    var results;
    console.log("채팅전송시작 " + req.params.id + "//" + req.body.user + "//" + req.body.chat);
    if (req.body.sender == null) sender = "qwer"; //nickName = "비회원";
    else sender = req.body.sender;

    if (req.body.receiver == null) receiver = "asdf"; //인터넷상에서 리시버랑 센더어케하는지모르겠어서 우선이렇게임시방편
    else receiver = req.body.receiver;
    try {


        results = await database.Room.find({
            _id: req.params.id
        });
        if (results[0]._doc.participant_is_exit || results[0]._doc.owner_is_exit) { //채팅방에 나간사람이 있다면
            await database.Room.findOneAndUpdate({
                _id: req.params.id
            }, {
                participant_is_exit: false,
                owner_is_exit: false,
                participant_count: 2
            }, {
                upsert: true,
                'new': true,
                setDefaultsOnInsert: true
            }, function (err2, results2) {
                if (err2) {
                    console.log('exit여부 수정 에러');
                    console.dir(err2);
                    return;
                }
                console.log('exit 여부 수정 성공');
                console.log("newRoom값 : " + JSON.stringify(results2));
                //room네임스페이스에 리시버닉네임으로되어있는 룸에게 전송
                req.app.get('io').of('/room').to(receiver).emit('newRoom', results2);
            });
            /*
            #원래 여기있었는데 await로해도 (정확히뭔진모르겠지만) 룸에서 검색해온값을 새로운변수 newRoom에 넣기전에
                newRoom값이 먼저찍힘 그래서 위로올려버림
                        console.log("newRoom값 : " + JSON.stringify(results2));
                        req.app.get('io').of('/room').to(receiver).emit('newRoom', results2);
            */

        }



        var chat = new database.Chat({
            room: req.params.id,
            sender: sender,
            receiver: receiver,
            chat: req.body.chat
        });
        await database.Room.findOneAndUpdate({
            _id: req.params.id
        }, {
            last_chat_contents: req.body.chat
        }, {
            upsert: true,
            'new': true,
            setDefaultsOnInsert: true
        }, function (err2, results2) {
            if (err2) {
                console.log('last_chat_contents 수정 에러');
                console.dir(err2);
                return;
            }
            console.log('last_chat_contents 성공');
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
    var current_page = req.query.current_page || 0;
    var start_page = current_page * LOADING_SIZE;
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
        var chats = await database.Chat.find({
            room: room._id
        }).sort({
            "createdAt": -1
        }).skip(start_page).limit(LOADING_SIZE);
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

var participantDown = async function (req, res, next) {
    console.log("participantDown 호출됨")
    console.log("방아이디 : " + req.params.id);

    var database = req.app.get('database');

    try {
        //database.Room.find({})..~~여기서 직접해줘도 왜 안드로이드에서 골뱅이로 받는거지..
        await database.Room.findOneAndUpdate({
            _id: req.params.id
        }, {
            $inc: {
                participant_count: -1
            },
            participant_is_exit: true
        }, {
            upsert: true,
            'new': true,
            setDefaultsOnInsert: true
        }, function (err2, results2) {
            if (err2) {
                console.log('참가자 감소 에러');
                console.dir(err2);
                return;
            }
            console.log('참가자 감소 성공');
            res.end();
        });


    } catch (error) {
        console.error(error);
        next(error);
    }
}
var ownerDown = async function (req, res, next) {
    console.log(" ownerDown 호출됨")
    console.log("방아이디 : " + req.params.id);
    var database = req.app.get('database');
    try {
        await database.Room.findOneAndUpdate({
            _id: req.params.id
        }, {
            $inc: {
                participant_count: -1
            },
            owner_is_exit: true
        }, {
            upsert: true,
            'new': true,
            setDefaultsOnInsert: true
        }, function (err2, results2) {
            if (err2) {
                console.log('참가자 감소 에러');
                console.dir(err2);
                return;
            }
            console.log('참가자 감소 성공');
        });
    } catch (error) {
        console.error(error);
        next(error);
    }
}

var post_room_android = async function (req, res, next) {
    var database = req.app.get('database');

    try {

        var room = await database.Room.findOne({
            _id: req.params.id
        });
        if (!room) { //존재하지 않는 room을 개설할때
            var room = new database.Room({
                title: "ㅠㅠ",
                max: 10,
                owner: req.body.nickname,
                owner_member_icon_file_name: req.body.owner_member_icon_file_name,
                participant_member_icon_file_name: req.body.participant_member_icon_file_name,
                password: req.body.password,
                participant: req.body.participant,
                participant_count: 2
            });
            var newRoom = await room.save();
            var io = req.app.get('io');

            console.log("참가자 : " + req.body.participant);
            io.of('/room').to(req.body.participant).emit('newRoom', newRoom); //채팅개설자가 나일때
            console.log("존재하지않는 방일때의 룸아이디 : " + newRoom[0]._doc._id);
            return res.status(200).send('' + newRoom[0]._doc._id);
        } else { //존재하는 방일때

            console.log("존재하는 방일때의 룸아이디 : " + room[0]._doc._id);
            return res.status(200).send('' + room[0]._doc._id);
        }



    } catch (error) {
        console.error(error);
        next(error);
    }
}



module.exports.post_room_android = post_room_android;
module.exports.ownerDown = ownerDown;
module.exports.participantDown = participantDown;
module.exports.getParticipant = getParticipant;
module.exports.getChatUserNickName = getChatUserNickName;
module.exports.get_room_android_id = get_room_android_id;
module.exports.post_room_id_chat = post_room_id_chat;
module.exports.delete_room_id = delete_room_id;
module.exports.get_room_id = get_room_id;
module.exports.post_room = post_room;
module.exports.get_room_start = get_room_start;
module.exports.get_room = get_room;
