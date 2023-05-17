class returndata {
    constructure(status,data,message){
        this.data = data;
        this.message = message;
        this.status = status;
        

    }
}
class status{
    constrcture(statusResponse , message){
    this.statusResponse = statusResponse;
    this.message = message;
    }
}
 module.exports = {
    returndata,
    status
};