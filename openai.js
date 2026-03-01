// ⚠ שמור מפתח זה במקום בטוח ולא בקוד ציבורי
// 'YOUR_OPENAI_API_KEY' הוא placeholder
const OPENAI_API_KEY = "YOUR_OPENAI_API_KEY";

async function createImageOpenAI(name,type,description){
    const prompt = `${name}, ${type}, ${description}, detailed, high quality`;
    const res = await fetch("https://api.openai.com/v1/images/generations",{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
            "Authorization":"Bearer " + OPENAI_API_KEY
        },
        body: JSON.stringify({
            model:"gpt-image-1",
            prompt: prompt,
            size:"512x512"
        })
    });
    const data = await res.json();
    if(data.data && data.data[0] && data.data[0].url){
        return data.data[0].url;
    } else {
        throw new Error("לא ניתן ליצור תמונה");
    }
}
