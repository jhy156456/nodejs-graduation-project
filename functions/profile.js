'use strict';


exports.getProfile = (database,email) => 
	
	new Promise((resolve,reject) => {

		database.UserModel.find({ email: email }, { name: 1, email: 1, created_at: 1, _id: 0 })

		.then(users => resolve(users[0]))

		.catch(err => reject({ status: 500, message: 'Internal Server Error !' }))

	});