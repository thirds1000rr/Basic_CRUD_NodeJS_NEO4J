require ('dotenv').config({path:'./.env'})
const { required } = require('nodemon/lib/config')
const neo4j = require('./neo4jqeury')
const express = require ('express')
const app = express()
const ModelReturndata = require('./returndata')
const bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())


const  createUser = async(body)=>{
    console.log("Create body = " , body );
    var result = new ModelReturndata.returndata()
    var cypher = `
        create(user:User{
        _id : '${body._id}',
        Firstname :'${body.Firstname}',
        Lastname : '${body.Lastname}',
        email : '${body.email}'
    })
        with distinct user {.*} as data 
        return data 
        `
        console.log("Create cypher = " , cypher );
     const returnData  = await neo4j.query(cypher)
    if (returnData.statusresponse){
        result.data =(()=>{
            var res = []
            returnData.data.records.forEach((item) => {
                var obj = {
                    data : item.get('data')
                }
                console.log(obj);
                res.push(obj)
                
            });
            return res 
        })()
    }
    result.status = returnData.statusResponse
    result.message = returnData.message
    return result
}
const createSensor = async(body)=>{
    var result = new ModelReturndata.returndata()
    const cypher  = `
    
    create (sensor:Sensor)
    set sensor._id = '${body.sensorId}'
    with sensor 

    match (user:User{_id:'${body.id}'})
    create (user)-[:owner]->(sensor)
    with sensor

    optional match (humid:Humid)
    with sensor ,humid 

    optional match (temp:Temp)
    with sensor , humid , temp 

    create (temp)<-[:value]-(sensor)-[:value]->(humid)
    with sensor

    return sensor{.*}  as sensor
    `
    const returnData = await neo4j.query(cypher)
    if(returnData.statusresponse){
        result.data = (()=>{
            var res = []
            returnData.data.records.forEach((item)=>{
                var obj = {data : item.get('sensor')
            }
            console.log(obj)
            res.push(obj)
                
            })
            return res ;
        })()
    }
    result.status = returnData.statusresponse
    result.message = returnData.message
    return result
}

const update = async(body)=>{
    var result = new ModelReturndata.returndata()
    const cypher = `
    match (user:User)
    where user._id = '${body._id}'
    set user.Firstname = '${body.Firstname}'
    set user.Lastname = '${body.Lastname}'
    set user.email = '${body.email}'
    return *
    `
    const returnData = await neo4j.query(cypher)
    if(returnData.statusresponse){
        result.data = (()=>{
            var res = []
            returnData.data.records.forEach((item)=>{
                var obj = {
                    _id :  item.get('user')._id,
                    Firstname : item.get('user').Firstname,
                    Lastname : item.get('user').Lastname,
                    email : item.get('user').email
                }
                res.push(obj)
            })
            return res 
        })
    }
    result.status = returnData.statusResponse
    result.status = returnData.message
    return result
}
const deleteSensor = async (body) =>{
    var result = new ModelReturndata.returndata()
    const cypher = ` match (user:User{_id:'${body.id}'})
    with user
    optinal match (user)-[owner:owner]->(sensor:Sensor{_id:'${body._idSensor}'})
    foreach(i in case wheb sensor is not null then[1] esle [] end | )
    detach delete sensor
    `

    const returnData = await neo4j.query(cypher)
    if(returnData.statusresponse){
        result.data = (()=>{
            var res = []
        })
    }
} 
const deleteUser = async(body)=>{
    var result = new ModelReturndata.returndata()
    const cypher = `
    match (user:User{_id:'${body.id}'})
    with user
    optional match (user)-[owner:owner]->(sensor:Sensor)
    foreach( i in case when sensor is not null then [1] else [] end |
    detach delete sensor 
    )
    detach delete user  
    return *
    `
    const returnData = await neo4j.query(cypher)
    if(returnData.statusresponse){
        result.data = (()=>{
            var res = []
            returnData.data.records.forEach((item)=>{
                let obj = {
                    user : item.get('user'),
                    sensor : item.get('snesor')
                 }
                 console.log(obj);
            res.push(obj);
                 
            })
        })()
    }
    result.status = returnData.statusresponse
    result.message = returnData.message
    return result
}


const getSensor = async(body)=>{
    var result = new ModelReturndata.returndata()
    const cypher = `
    with sensor 
    optional match (user:User{_id:"${body.id}"})
    with sensor , user
    create (user)-[:owner]->(sensor)
    with sensor , user
    optional match (humid:Humid)
    with humid,sensor,user
    optional match (temp:Temp)
    with humid , temp , sensor ,user
    create (temp)<-[:value]-(sensor)-[:value]->(humid)
    with collect(sensor.id) as Sensor_id , user 
    return distinct user{.*} as User , Sensor_id `
     const returnData = await neo4j.query(cypher)
     if(returnData.statusresponse){
        result.data = (()=>{
            var res = []
            returnData.data.records.forEach((item)=>{
                let obj = {
                    userDetail : {
                    _id : item.get('user')._id,
                    firstname : item.get('user').Firstname,
                    lastname : item.get('user').Lastname,
                    email : item.get ('user').email
                    },
                    sensorDetail : {
                        _idSensor : item.get('sensor')?.id ,
                        name : item.get('sensor')?.name ,
                        temperature : item.get('temp')?.temp,
                        humidity : item.get('humid')?.humid
                        

                    }
                }


                console.log(obj);
                res.push(obj)

            });
            return res 
        })()
     }
     result.status = returnData.statusresponse
     result.message = returnData.message
     return result
}








///api
app.post('/createUser',async(req , res)=>{
    console.log('api post /home req = ' , req.body);
    const result = await createUser(req.body)
    res.json(result)
})

app.post('/getSensor',async(req,res)=>{
    console.log('api post /get req =' , req.body);
    const result = await getSensor(req.body)
    res.json(result)
})

app.post('/update',async(req,res)=>{
    console.log('api post /update req = ',req.body)
    const result = await update(req.body)
    res.json(result)
})
app.post('/deleteUser',async(req,res)=>{
    console.log('api post /delete req = ',req.body)
    const result = await deleteUser(req.body)
    res.json(result)
})
app.post('/createSensor',async(req,res)=>{
    console.log('api post /createSensor = ',req.body);
    const result = await createSensor(req.body)
    res.json(result)
})



//port listen
app.listen(process.env.PORT, ()=>{
    console.log('start server at port .',process.env.PORT)
})