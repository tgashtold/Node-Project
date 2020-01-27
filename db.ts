module.exports =  require('knex')({
	client: 'mssql',
	connection: {
		host: '127.0.0.1',
		user: 'DBUser',
		password: '12345USERforDB',
		database: 'ProgAssistant'
	}
});