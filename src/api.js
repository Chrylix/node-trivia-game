const request = require('request'); 

const triviaFunc = async (numberOfQuestions, category, difficulty, callback)=>{
    
    let apiUrl= `https://opentdb.com/api.php?amount=${numberOfQuestions}&category=${category}&difficulty=${difficulty}&type=multiple`
    try {
        await request ({ url: apiUrl, json:true}, (error,response) =>{
            if (error){
                console.log('there is an error in the api')
            } else if (response.body === undefined){
                console.log(`Difficulty of category don't exist`)
            } else{
                callback(response.body)
            }
        })
    } catch(error) {
        console.error(error);
    }
};

module.exports = triviaFunc;