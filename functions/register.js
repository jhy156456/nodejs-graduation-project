'use strict';


const bcrypt = require('bcryptjs');

exports.registerUser = (database,name, email, password,sextype,birthday,nickName) => 

	new Promise((resolve,reject) => {

	    const salt = bcrypt.genSaltSync(10);
		const hash = bcrypt.hashSync(password, salt);

		const newUser = new database.UserModel({
            sextype : sextype,
            birthday : birthday,
			name: name,
			email: email,
            nickname:nickName,
			hashed_password: hash,
			created_at: new Date()
		});

		newUser.save()

		.then(() => resolve({ status: 201, message: 'User Registered Sucessfully !' }))

		.catch(err => {

			if (err.code == 11000) {
						
				reject({ status: 409, message: 'User Already Registered !' });

			} else {

				reject({ status: 500, message: 'Internal Server Error !' });
			}
		});
	});


