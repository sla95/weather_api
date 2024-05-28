const mysql = require('mysql');

const connection = mysql.createConnection({
	host: 'localhost',
	database: 'users',
	user: 'root',
	password: 'mydatabase1*'
});

connection.connect(function(error){
	if (error)
	{
		throw error;
	}
	else
	{
		console.log ('MySQL database connected successfully!')
	}
});

module.exports = connection;
