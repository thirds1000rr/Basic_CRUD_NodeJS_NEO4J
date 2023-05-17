require ('dotenv').config({path:'./.env'})
const neo4j = require("neo4j-driver");
const driver = neo4j.driver(
    process.env.NEO4J_URI,
    neo4j.auth.basic(
        process.env.NEO4J_USERNAME , 
        process.env.NEO4J_PASSWORD));
const session = driver.session();
console.log("test",process.env.NEO4J_URI);

const query = async (cypher,parameter) => {
    var res = {
        data : null ,
        statusresponse : false ,
        message : ""

    }
    try {
        console.log("Cypther" , cypher);
        res.data = await session.run(cypher,parameter);
        res.statusresponse = true
        res.message = 'OK'
        return res

    } catch (error) {
     console.log(error);
     res.statusresponse = false
     res.message = error
     return res;
        
    }

}; 

module.exports = {
    query,
};