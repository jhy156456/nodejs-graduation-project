module.exports = {
    server_port: 3000,
    db_url: 'mongodb://jhy156456:vmflsxj1@ds237192.mlab.com:37192/graduation_project',
    db_schemas: [
        {
            file: './order_schema',
            collection: 'order',
            schemaName: 'OrderSchema',
            modelName: 'OrderModel'
        },
        {
            file: './post_schema',
            collection: 'post',
            schemaName: 'PostSchema',
            modelName: 'PostModel'
        },
        {
            file: './device_schema',
            collection: 'devices',
            schemaName: 'DeviceSchema',
            modelName: 'DeviceModel'
        },


        {
            file: './buy_software_info_schema',
            collection: 'software',
            schemaName: 'SoftwareInfoSchema',
            modelName: 'SoftwareInfoModel'
        },

        {
            file: './buy_software_info_image_schema',
            collection: 'softwareimage',
            schemaName: 'SoftwareInfoImageSchema',
            modelName: 'SoftwareInfoImageModel'
        },

        {
            file: './buy_software_keep_schema',
            collection: 'softwarekeep',
            schemaName: 'SoftwareKeepSchema',
            modelName: 'SoftwareKeepModel'
        },
        {
            file: './user',
            collection: 'user',
            schemaName: 'UserSchema',
            modelName: 'UserModel'
        },
        {
            file: './bestfood_member_schema',
            collection: 'bestfood_member',
            schemaName: 'bestfood_memberschema',
            modelName: 'bestfood_membermodel'
        },
	],

    route_info: [
        //orderCheckItem라우터
        {
            file: './order',
            path: '/order/addorder',
            method: 'addOrderCheckItem',
            type: 'post'
        },

//Doit 게시판 구현 시작
        {
            file: './post',
            path: '/process/addpost',
            method: 'addpost',
            type: 'post'
        }
        , {
            file: './post',
            path: '/process/showpost/:id',
            method: 'showpost',
            type: 'get'
        }
        , {
            file: './post',
            path: '/process/listpost',
            method: 'listpost',
            type: 'post'
        }
        , {
            file: './post',
            path: '/process/listpost',
            method: 'listpost',
            type: 'get'
        }, {
            file: './post',
            path: '/process/addcomment',
            method: 'addcomment',
            type: 'post'
        },
        {
            file: './post',
            path: '/process/removecomment',
            method: 'removeComment',
            type: 'get'
        },
//Doit 게시판 구현 끝
        //Doit 알림구현 시작
        {
            file: './device',
            path: '/process/adddevice',
            method: 'adddevice',
            type: 'post'
        }
	    , {
            file: './device',
            path: '/process/listdevice',
            method: 'listdevice',
            type: 'post'
        }
	    , {
            file: './device',
            path: '/process/register',
            method: 'register',
            type: 'post'
        }
	    , {
            file: './device',
            path: '/process/sendall',
            method: 'sendall',
            type: 'post'
        }
        //Doit 알림구현 끝
//베스트푸드책 구현 시작
        , {
            file: './member',
            path: '/member/:email',
            method: 'email',
            type: 'get'
        }
	    , {
            file: './member',
            path: '/member/phone',
            method: 'member_phone',
            type: 'post'
        }
        , {
            file: './member',
            path: '/member/info',
            method: 'member_info',
            type: 'post'
        }
        , {
            file: './member',
            path: '/member/icon_upload',
            method: 'member_icon_upload',
            type: 'post'
        }

	    , {
            file: './buy_software',
            path: '/food/info',
            method: 'info',
            type: 'post'
        }
        , {
            file: './buy_software',
            path: '/food/info/image',
            method: 'info_image',
            type: 'post'
        }
        , {
            file: './buy_software',
            path: '/food/info/:seq',
            method: 'info_seq',
            type: 'get'
        }
        , {
            file: './buy_software',
            path: '/food/list',
            method: 'list',
            type: 'get'
        }
        , { //등록된 게시글 닉네임 클릭 후 프로필보기
            file: './buy_software',
            path: '/food/postedlist',
            method: 'postedList',
            type: 'get'
        }, {
            file: './buy_software',
            path: '/food/addcomment',
            method: 'addcomment',
            type: 'post'
        }
        , {
            file: './buy_keep',
            path: '/keep/list',
            method: 'keep_list',
            type: 'get'
        }
        , {
            file: './buy_keep',
            path: '/keep/:member_seq/:info_seq',
            method: 'keep_info_seq_post',
            type: 'post'
        }
        , {
            file: './buy_keep',
            path: '/keep/:member_seq/:info_seq',
            method: 'keep_info_seq_delete',
            type: 'delete'
        }

        //베스트푸드책 구현 끝
        ////////////////////////////////////////////로그인 시작

                        , { //wantMemberSeq로 원하는 멤버의 프로필 조회
            file: './loginRoutes',
            path: '/users/:seq',
            method: 'getUser',
            type: 'get'
        }
                , {
            file: './loginRoutes',
            path: '/',
            method: 'one',
            type: 'get'
        }
                , {
            file: './loginRoutes',
            path: '/authenticate',
            method: 'two',
            type: 'post'
        }                , {
            file: './loginRoutes',
            path: '/users/check/:nickname',
            method: 'checkDuplicatedNickName',
            type: 'get'
        }
                , {
            file: './loginRoutes',
            path: '/users',
            method: 'three',
            type: 'post'
        }
                , {
            file: './loginRoutes',
            path: '/users/:id',
            method: 'four',
            type: 'get'
        }
                , {
            file: './loginRoutes',
            path: '/users/:id',
            method: 'five',
            type: 'put'
        }
                , {
            file: './loginRoutes',
            path: '/users/:id/password',
            method: 'six',
            type: 'post'
        }
        ]
}
