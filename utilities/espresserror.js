class expreessError extends Error{
    constructor(message,statusCode){
    super();
    this.message = message;
    this.statusCode = statusCode;
}}

module.exports = expreessError;
