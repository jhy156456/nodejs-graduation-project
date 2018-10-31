var express = require('express');
var formidable = require('formidable');
var async = require('async');
var router = express.Router();

var showOrderItem = function(req,res){
    
}

var addOrderCheckItem = function (req, res) {
    console.log('addOrderCheckItem 호출됨.');

    var database = req.app.get('database');

    var paramPostNickName = req.body.postNickName || req.query.postNickName;
    var paramBuyerMemberSeq = req.body.buyerMemberSeq || req.query.buyerMemberSeq;
    var paramPostSeq = req.body.postSeq || req.query.postSeq;
    var paramPostMemberSeq = req.body.buyerMemberSeq || req.query.buyerMemberSeq;
    var paramBuyerMemberNickName = req.body.buyerMemberNickName || req.query.buyerMemberNickName;
    var paramBuyerMemberSeq = req.body.buyerMemberSeq || req.query.buyerMemberSeq;
    
    


    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {

        // DeviceModel 인스턴스 생성
        var device = new database.OrderModel({
            "seller_nickname": paramPostNickName,
            "sellerid": paramPostMemberSeq,
            "buyerid": paramBuyerMemberSeq,
            "postid": paramPostSeq,
            "buyer_nickname": paramBuyerMemberNickName
        });

        // save()로 저장
        device.save(function (err) {
            if (err) {
                console.error('주문 정보 추가중 에러 발생 : ' + err.stack);
                res.end();
                return;
            }
            console.log("주문정보 추가함.");
            res.end();
        });
    } else {
        console.log("데이터베이스 연결 실패");
        res.end();
    }

};





module.exports.addOrderCheckItem = addOrderCheckItem;
module.exports.showOrderItem=showOrderItem;