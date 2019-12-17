import { resolveAny } from "dns";

let totalScore=0;

function nextQuestion(){
    if (difficulty=="easy"){
        if(answer==correctAnswer){
            totalScore+=1
        }else{
            console.log("incorrect answer")
        }
    }else if(difficulty=="medium"){
        if(answer==correctAnswer){
            totalScore+=2
        }else{
            console.log("wrong answer")
        }
    }else if(difficulty=="hard"){
        if(answer==correctAnswer){
            totalScore+=3
        }else{
            console.log("very wrong answer")
        }
    }
    res.render('apiView', {
        question: (questionObject.question1.question),
        answers: arrayAnswers,
    });
}