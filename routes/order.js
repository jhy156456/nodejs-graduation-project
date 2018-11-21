var express = require('express');
var formidable = require('formidable');
var async = require('async');
var router = express.Router();

var showOrderItem = function (req, res) {

}

var addOrderCheckItem = function (req, res) {
    console.log('addOrderCheckItem 호출됨.');

    var database = req.app.get('database');

    var paramPostNickName = req.body.seller_nickname || req.query.seller_nickname;
    var paramBuyerMemberSeq = req.body.buyerMemberSeq || req.query.buyerMemberSeq;
    var paramPostSeq = req.body.postSeq || req.query.postSeq;
    var paramPostMemberSeq = req.body.buyerMemberSeq || req.query.buyerMemberSeq;
    var paramBuyerMemberNickName = req.body.buyer_nickname || req.body.buyer_nickname;
    var paramBuyerMemberSeq = req.body.buyerMemberSeq || req.query.buyerMemberSeq;
    var paramPostMemeberIconFileName = req.body.post_member_icon_file_name;
    var paramInfoFirstImageFileName = req.body.info_first_image_file_name;
    var paramCardHolder = req.body.card_holder;
    var paraCardNumber = req.body.card_number;
    var paramInfoTitle = req.body.info_title;
    var paramPostPrice = req.body.post_price;
  //  console.log("바디값 : " + JSON.stringify(req.body))
    // 데이터베이스 객체가 초기화된 경우
    if (database.db) {

        // DeviceModel 인스턴스 생성
        var device = new database.OrderModel({
            "seller_nickname": paramPostNickName,
            "sellerid": paramPostMemberSeq,
            "buyerid": paramBuyerMemberSeq,
            "postid": paramPostSeq,
            "buyer_nickname": paramBuyerMemberNickName,
            post_member_icon_file_name: paramPostMemeberIconFileName,
            info_first_image_file_name: paramInfoFirstImageFileName,
            card_number: paraCardNumber,
            card_holder: paramCardHolder,
            info_title:paramInfoTitle
        });

        // save()로 저장
        device.save(function (err,result) {
            if (err) {
                console.error('주문 정보 추가중 에러 발생 : ' + err.stack);
                res.end();
                return;
            }
            //console.log("추가한 주문정보값 : " + JSON.stringify(result))
            console.log("주문정보 추가함.");
            res.end();
        });
    } else {
        console.log("데이터베이스 연결 실패");
        res.end();
    }

};





module.exports.addOrderCheckItem = addOrderCheckItem;
module.exports.showOrderItem = showOrderItem;
